import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from './database.js'

const router = Router()

// GET /api/rsvps?eventId=  — list RSVPs for an event
router.get('/', (req, res) => {
  const db = getDb()
  const { eventId } = req.query
  if (!eventId) return res.status(400).json({ error: 'eventId query param required' })
  const rsvps = db.prepare('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at DESC').all(eventId)
  res.json(rsvps)
})

// GET /api/rsvps/recent — latest RSVPs across all events
router.get('/recent', (req, res) => {
  const db = getDb()
  const limit = Number(req.query.limit) || 10
  const rsvps = db.prepare(`
    SELECT r.*, e.title as event_title, e.emoji as event_emoji
    FROM rsvps r
    JOIN events e ON r.event_id = e.id
    ORDER BY r.created_at DESC
    LIMIT ?
  `).all(limit)
  res.json(rsvps)
})

// POST /api/rsvps — RSVP to an event
router.post('/', (req, res) => {
  const db = getDb()
  const { event_id, guest_name, guest_email, guest_count = 1, note = '' } = req.body

  if (!event_id || !guest_name || !guest_email) {
    return res.status(400).json({ error: 'Missing required fields: event_id, guest_name, guest_email' })
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id)
  if (!event) return res.status(404).json({ error: 'Event not found' })
  if (event.status === 'full') return res.status(409).json({ error: 'Event is full' })
  if (event.status === 'draft') return res.status(409).json({ error: 'Event is not open yet' })
  if (event.status === 'cancelled') return res.status(409).json({ error: 'Event is cancelled' })

  const count = Number(guest_count)
  if (count > event.spots_left) {
    return res.status(409).json({ error: `Only ${event.spots_left} spots remaining` })
  }

  // Check duplicate RSVP
  const existing = db.prepare('SELECT id FROM rsvps WHERE event_id = ? AND guest_email = ?').get(event_id, guest_email)
  if (existing) return res.status(409).json({ error: 'This email has already RSVPed to this event' })

  const id = `rsvp-${uuid()}`
  db.prepare(`
    INSERT INTO rsvps (id, event_id, guest_name, guest_email, guest_count, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, event_id, guest_name, guest_email, count, note)

  // Update spots_left and status
  const newSpotsLeft = event.spots_left - count
  const newStatus = newSpotsLeft === 0 ? 'full' : event.status
  db.prepare('UPDATE events SET spots_left = ?, status = ? WHERE id = ?').run(newSpotsLeft, newStatus, event_id)

  const rsvp = db.prepare('SELECT * FROM rsvps WHERE id = ?').get(id)
  res.status(201).json(rsvp)
})

// DELETE /api/rsvps/:id — cancel an RSVP
router.delete('/:id', (req, res) => {
  const db = getDb()
  const rsvp = db.prepare('SELECT * FROM rsvps WHERE id = ?').get(req.params.id)
  if (!rsvp) return res.status(404).json({ error: 'RSVP not found' })

  db.prepare('DELETE FROM rsvps WHERE id = ?').run(req.params.id)

  // Restore spots
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(rsvp.event_id)
  if (event) {
    const newSpotsLeft = event.spots_left + rsvp.guest_count
    const newStatus = event.status === 'full' ? 'open' : event.status
    db.prepare('UPDATE events SET spots_left = ?, status = ? WHERE id = ?').run(newSpotsLeft, newStatus, rsvp.event_id)
  }

  res.json({ success: true })
})

export default router