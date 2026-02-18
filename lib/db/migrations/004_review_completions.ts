import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration004: Migration = {
  version: 4,
  name: 'review_completions',
  up: async (db: Database) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS review_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        completed_date TEXT NOT NULL,
        type TEXT NOT NULL,
        mode TEXT NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(completed_date, type, mode)
      )
    `)
  },
}
