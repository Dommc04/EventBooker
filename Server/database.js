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
  // Removed seedIfEmpty() - no more example data!
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
  
  // Insert a default user so the app works
  run(`INSERT OR IGNORE INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`, 
    ['user-host-1', 'Host', 'host@mixer.app', 'hashed'])
  
  save()
}