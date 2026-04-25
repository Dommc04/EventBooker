import { Router } from 'express'
import { getDb } from './database.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const db = getDb()
    
    const totalRsvpsResult = db.get('SELECT COALESCE(SUM(guest_count), 0) as total FROM rsvps')
    const totalRsvps = totalRsvpsResult?.total || 0
    
    const activeEventsResult = db.get("SELECT COUNT(*) as count FROM events WHERE status IN ('open', 'full')")
    const activeEvents = activeEventsResult?.count || 0
    
    const totalEventsResult = db.get('SELECT COUNT(*) as count FROM events')
    const totalEvents = totalEventsResult?.count || 0
    
    const draftEventsResult = db.get("SELECT COUNT(*) as count FROM events WHERE status = 'draft'")
    const draftEvents = draftEventsResult?.count || 0

    res.json({ totalRsvps, activeEvents, totalEvents, draftEvents })
  } catch (error) {
    console.error('Error getting stats:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router