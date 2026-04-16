import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'

let db: Database.Database

export function getDB(): Database.Database {
  if (!db) throw new Error('DB not initialized')
  return db
}

export function initDB() {
  const dbPath = path.join(app.getPath('userData'), 'aquarium.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS fish_state (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      fish_type TEXT NOT NULL,
      unread_count INTEGER DEFAULT 0,
      first_seen_unread_at INTEGER,
      last_acknowledged_at INTEGER,
      current_scale REAL DEFAULT 0.4,
      color_phase_offset REAL DEFAULT 0,
      label TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS license (
      id INTEGER PRIMARY KEY DEFAULT 1,
      key TEXT,
      instance_id TEXT,
      validated_at INTEGER,
      is_valid INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS oauth_tokens (
      provider TEXT PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      expires_at INTEGER
    );
  `)

  // Ensure an instance_id exists for license activation
  const row = db.prepare('SELECT instance_id FROM license WHERE id = 1').get() as
    | { instance_id: string }
    | undefined
  if (!row) {
    db.prepare('INSERT OR IGNORE INTO license (id, instance_id) VALUES (1, ?)').run(uuidv4())
  }

  // Default settings
  const defaults: Record<string, string> = {
    slackPollIntervalMs: '60000',
    gmailPollIntervalMs: '90000',
    muted: 'false',
    alwaysOnTop: 'true',
    startWithWindows: 'false',
    fishRenderer: 'procedural',
  }
  const upsert = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  )
  for (const [key, value] of Object.entries(defaults)) {
    upsert.run(key, value)
  }
}
