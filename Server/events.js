import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from './database.js'

const router = Router()

// GET /api/events — list all events
router.get('/', (req, res) => {
  const db = getDb()
  const { status } = req.query
  let query = 'SELECT * FROM events'
  const params = []
  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }
  query += ' ORDER BY date ASC'
  const events = db.prepare(query).all(...params)
  res.json(events)
})

// GET /api/events/:id — get single event
router.get('/:id', (req, res) => {
  const db = getDb()
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event not found' })
  res.json(event)
})

// POST /api/events — create event
router.post('/', (req, res) => {
  const db = getDb()
  const { title, description, host_name, date, time, venue, capacity, emoji, status } = req.body

  if (!title || !host_name || !date || !time || !venue || !capacity) {
    return res.status(400).json({ error: 'Missing required fields: title, host_name, date, time, venue, capacity' })
  }

  const id = `evt-${uuid()}`
  const event = {
    id,
    title,
    description: description || '',
    host_id: 'user-host-1',
    host_name,
    date,
    time,
    venue,
    capacity: Number(capacity),
    spots_left: Number(capacity),
    status: status || 'open',
    emoji: emoji || '🎉',
  }

  db.prepare(`
    INSERT INTO events (id, title, description, host_id, host_name, date, time, venue, capacity, spots_left, status, emoji)
    VALUES (@id, @title, @description, @host_id, @host_name, @date, @time, @venue, @capacity, @spots_left, @status, @emoji)
  `).run(event)

  res.status(201).json(event)
})

// PATCH /api/events/:id — update event
router.patch('/:id', (req, res) => {
  const db = getDb()
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event not found' })

  const allowed = ['title', 'description', 'host_name', 'date', 'time', 'venue', 'capacity', 'status', 'emoji']
  const updates = {}
  allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key] })

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  const setClauses = Object.keys(updates).map(k => `${k} = @${k}`).join(', ')
  db.prepare(`UPDATE events SET ${setClauses} WHERE id = @id`).run({ ...updates, id: req.params.id })

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE /api/events/:id — delete event
router.delete('/:id', (req, res) => {
  const db = getDb()
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event not found' })
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router