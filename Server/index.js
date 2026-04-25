import express from 'express'
import cors from 'cors'
import eventsRouter from './events.js'
import rsvpsRouter from './rsvps.js'
import statsRouter from './stats.js'
import { initDb, getDb } from './database.js'

const app = express()
const PORT = process.env.PORT || 3001

// CORS - allow all origins for development
app.use(cors())
app.use(express.json())

// Initialize database
await initDb()

// Routes
app.use('/api/events', eventsRouter)
app.use('/api/rsvps', rsvpsRouter)
app.use('/api/stats', statsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Mixer', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🍹 Mixer server running at http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
})