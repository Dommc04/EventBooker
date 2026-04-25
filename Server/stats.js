import { Router } from 'express'
import { getDb } from '../db/database.js'

const router = Router()

// GET /api/stats — dashboard summary stats
router.get('/', (req, res) => {
  const db = getDb()

  const totalRsvps = db.prepare('SELECT COALESCE(SUM(guest_count), 0) as total FROM rsvps').get().total
  const activeEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status IN ('open', 'full')").get().count
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count
  const draftEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'draft'").get().count

  res.json({ totalRsvps, activeEvents, totalEvents, draftEvents })
})

export default router