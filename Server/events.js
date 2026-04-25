import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from './database.js'

const router = Router()

// GET all events
router.get('/', async (req, res) => {
  try {
    const db = getDb()
    const { status } = req.query
    let query = 'SELECT * FROM events'
    const params = []
    
    if (status && status !== 'all') {
      query += ' WHERE status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY date ASC'
    const events = db.all(query, params)
    res.json(events)
  } catch (error) {
    console.error('Error getting events:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const db = getDb()
    const event = db.get('SELECT * FROM events WHERE id = ?', [req.params.id])
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    res.json(event)
  } catch (error) {
    console.error('Error getting event:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST create event
router.post('/', async (req, res) => {
  try {
    const db = getDb()
    const { title, description, host_name, date, time, venue, capacity, emoji, status } = req.body

    // Validation
    if (!title || !host_name || !date || !time || !venue || !capacity) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, host_name, date, time, venue, capacity' 
      })
    }

    const id = `evt-${uuid()}`
    const capacityNum = Number(capacity)
    
    const event = {
      id,
      title,
      description: description || '',
      host_id: 'user-host-1',
      host_name,
      date,
      time,
      venue,
      capacity: capacityNum,
      spots_left: capacityNum,
      status: status || 'open',
      emoji: emoji || '🎉'
    }

    db.run(`
      INSERT INTO events (id, title, description, host_id, host_name, date, time, venue, capacity, spots_left, status, emoji)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      event.id, event.title, event.description, event.host_id, event.host_name,
      event.date, event.time, event.venue, event.capacity, event.spots_left,
      event.status, event.emoji
    ])

    console.log('Event created:', event.title)
    res.status(201).json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ error: error.message })
  }
})

// PATCH update event
router.patch('/:id', async (req, res) => {
  try {
    const db = getDb()
    const event = db.get('SELECT * FROM events WHERE id = ?', [req.params.id])
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const allowed = ['title', 'description', 'host_name', 'date', 'time', 'venue', 'capacity', 'status', 'emoji']
    const updates = {}
    
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    })

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(updates), req.params.id]
    
    db.run(`UPDATE events SET ${setClause} WHERE id = ?`, values)

    const updated = db.get('SELECT * FROM events WHERE id = ?', [req.params.id])
    res.json(updated)
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb()
    const event = db.get('SELECT * FROM events WHERE id = ?', [req.params.id])
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    // Delete associated RSVPs first
    db.run('DELETE FROM rsvps WHERE event_id = ?', [req.params.id])
    db.run('DELETE FROM events WHERE id = ?', [req.params.id])
    
    res.json({ success: true, message: 'Event deleted' })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router