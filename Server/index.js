import express from 'express'
import cors from 'cors'
import eventsRouter from './routes/events.js'
import rsvpsRouter from './routes/rsvps.js'
import statsRouter from './routes/stats.js'
import { getDb } from './db/database.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Init DB on startup
getDb()

app.use('/api/events', eventsRouter)
app.use('/api/rsvps', rsvpsRouter)
app.use('/api/stats', statsRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Mixer' }))

app.listen(PORT, () => {
  console.log(`🍹 Mixer server running at http://localhost:${PORT}`)
})