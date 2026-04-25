import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '../../mixer.db')

let db
let initialized = false

export async function getDb() {
  if (initialized) return { run, get, all }
  const SQL = await initSqlJs()
  if (existsSync(DB_PATH)) {
    db = new SQL.Database(readFileSync(DB_PATH))
  } else {
    db = new SQL.Database()
  }
  initSchema()
  seedIfEmpty()
  initialized = true
  return { run, get, all }
}

function save() {
  writeFileSync(DB_PATH, Buffer.from(db.export()))
}

function run(sql, params = []) {
  db.run(sql, params)
  save()
  return db
}

function get(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const result = stmt.step() ? stmt.getAsObject() : null
  stmt.free()
  return result
}

function all(sql, params = []) {
  const results = []
  const stmt = db.prepare(sql)
  stmt.bind(params)
  while (stmt.step()) results.push(stmt.getAsObject())
  stmt.free()
  return results
}

function initSchema() {
  db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', host_id TEXT NOT NULL, host_name TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, venue TEXT NOT NULL, capacity INTEGER NOT NULL, spots_left INTEGER NOT NULL, status TEXT DEFAULT 'open', emoji TEXT DEFAULT '🎉', created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS rsvps (id TEXT PRIMARY KEY, event_id TEXT NOT NULL, guest_name TEXT NOT NULL, guest_email TEXT NOT NULL, guest_count INTEGER NOT NULL DEFAULT 1, note TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')))`)
  save()
}

function seedIfEmpty() {
  const r = get('SELECT COUNT(*) as c FROM events')
  if (r && r.c > 0) return
  run(`INSERT OR IGNORE INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`, ['user-host-1', 'Alex Morgan', 'alex@mixer.app', 'hashed'])
  const events = [
    ['evt-1', "Mia's Birthday Bash", 'Come celebrate Mia turning 30! Drinks, music, rooftop views.', 'user-host-1', 'Mia Chen', '2025-06-14', '7:00 PM', 'The Rooftop, NYC', 50, 16, 'open', '🎂'],
    ['evt-2', 'Summer Pool Party', 'The annual pool party is back. Bring a towel and good vibes.', 'user-host-1', 'Jake R.', '2025-06-21', '2:00 PM', 'Hamptons Estate', 80, 0, 'full', '🌊'],
    ['evt-3', 'Graduation Garden Party', 'Celebrating the Lee kids graduating. Family and friends welcome.', 'user-host-1', 'The Lees', '2025-07-05', '12:00 PM', 'Riverside Park', 50, 30, 'open', '🌸'],
    ['evt-4', 'Rooftop Cocktail Night', 'An intimate cocktail evening with city views.', 'user-host-1', 'Priya S.', '2025-07-12', '8:00 PM', 'Hotel 47', 30, 30, 'draft', '🍸'],
  ]
  for (const e of events) run(`INSERT INTO events (id,title,description,host_id,host_name,date,time,venue,capacity,spots_left,status,emoji) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, e)
  const rsvps = [
    ['rsvp-1','evt-1','Sara Alvarez','sara@email.com',2,'So excited!','2025-05-20 10:00:00'],
    ['rsvp-2','evt-1','Nina Patel','nina@email.com',3,'','2025-05-19 14:00:00'],
    ['rsvp-3','evt-2','Tom Kim','tom@email.com',1,'','2025-05-18 09:00:00'],
    ['rsvp-4','evt-2','Chris Lee','chris@email.com',2,'Bringing snacks','2025-05-17 11:00:00'],
  ]
  for (const r of rsvps) run(`INSERT INTO rsvps (id,event_id,guest_name,guest_email,guest_count,note,created_at) VALUES (?,?,?,?,?,?,?)`, r)
  console.log('✅ Database seeded')
}