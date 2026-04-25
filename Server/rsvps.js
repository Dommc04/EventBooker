import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from './database.js'

const router = Router()

// GET RSVPs for an event
router.get('/', async (req, res) => {
  try {
    const db = getDb()
    const { eventId } = req.query
    
    if (!eventId) {
      return res.status(400).json({ error: 'eventId query param required' })
    }
    
    const rsvps = db.all('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at DESC', [eventId])
    res.json(rsvps)
  } catch (error) {
    console.error('Error getting RSVPs:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET recent RSVPs
router.get('/recent', async (req, res) => {
  try {
    const db = getDb()
    const limit = Number(req.query.limit) || 10
    
    const rsvps = db.all(`
      SELECT r.*, e.title as event_title, e.emoji as event_emoji, e.id as event_id
      FROM rsvps r
      JOIN events e ON r.event_id = e.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `, [limit])
    
    res.json(rsvps)
  } catch (error) {
    console.error('Error getting recent RSVPs:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST create RSVP
router.post('/', async (req, res) => {
  try {
    const db = getDb()
    const { event_id, guest_name, guest_email, guest_count = 1, note = '' } = req.body

    if (!event_id || !guest_name || !guest_email) {
      return res.status(400).json({ error: 'Missing required fields: event_id, guest_name, guest_email' })
    }

    const event = db.get('SELECT * FROM events WHERE id = ?', [event_id])
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    if (event.status === 'cancelled') {
      return res.status(409).json({ error: 'Event is cancelled' })
    }
    
    if (event.status === 'draft') {
      return res.status(409).json({ error: 'Event is not open yet' })
    }

    const count = Number(guest_count)
    
    if (count > event.spots_left) {
      return res.status(409).json({ error: `Only ${event.spots_left} spots remaining` })
    }

    // Check for duplicate RSVP
    const existing = db.get('SELECT id FROM rsvps WHERE event_id = ? AND guest_email = ?', [event_id, guest_email])
    
    if (existing) {
      return res.status(409).json({ error: 'This email has already RSVPed to this event' })
    }

    const id = `rsvp-${uuid()}`
    
    db.run(`
      INSERT INTO rsvps (id, event_id, guest_name, guest_email, guest_count, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, event_id, guest_name, guest_email, count, note])

    // Update spots left
    const newSpotsLeft = event.spots_left - count
    const newStatus = newSpotsLeft === 0 ? 'full' : event.status
    db.run('UPDATE events SET spots_left = ?, status = ? WHERE id = ?', [newSpotsLeft, newStatus, event_id])

    const rsvp = db.get('SELECT * FROM rsvps WHERE id = ?', [id])
    res.status(201).json(rsvp)
  } catch (error) {
    console.error('Error creating RSVP:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE RSVP
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb()
    const rsvp = db.get('SELECT * FROM rsvps WHERE id = ?', [req.params.id])
    
    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' })
    }

    db.run('DELETE FROM rsvps WHERE id = ?', [req.params.id])

    // Restore spots
    const event = db.get('SELECT * FROM events WHERE id = ?', [rsvp.event_id])
    
    if (event) {
      const newSpotsLeft = event.spots_left + rsvp.guest_count
      const newStatus = event.status === 'full' ? 'open' : event.status
      db.run('UPDATE events SET spots_left = ?, status = ? WHERE id = ?', [newSpotsLeft, newStatus, rsvp.event_id])
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router