import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'mixer.db')

let db = null
let SQL = null

export async function initDb() {
  SQL = await initSqlJs()
  
  if (existsSync(DB_PATH)) {
    const data = readFileSync(DB_PATH)
    db = new SQL.Database(data)
    console.log('Database loaded from disk')
  } else {
    db = new SQL.Database()
    console.log('New database created')
  }
  
  createTables()
  save()
  return db
}

function save() {
  if (db) {
    const data = db.export()
    writeFileSync(DB_PATH, Buffer.from(data))
  }
}

function createTables() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  // Events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    host_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    spots_left INTEGER NOT NULL,
    status TEXT DEFAULT 'open',
    emoji TEXT DEFAULT '🎉',
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  // RSVPs table
  db.run(`CREATE TABLE IF NOT EXISTS rsvps (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 1,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  // Insert default user
  try {
    db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash) 
            VALUES (?, ?, ?, ?)`, 
      ['user-host-1', 'Host', 'host@mixer.app', 'hashed'])
  } catch(e) {
    console.log('User already exists')
  }
  
  save()
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  
  return {
    run: (sql, params = []) => {
      const stmt = db.prepare(sql)
      stmt.bind(params)
      stmt.step()
      stmt.free()
      save()
    },
    get: (sql, params = []) => {
      const stmt = db.prepare(sql)
      stmt.bind(params)
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result
    },
    all: (sql, params = []) => {
      const results = []
      const stmt = db.prepare(sql)
      stmt.bind(params)
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    }
  }
}