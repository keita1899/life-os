import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration011: Migration = {
  version: 11,
  name: 'interview_qa',
  up: async (db: Database) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS interview_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS interview_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT DEFAULT NULL,
        category_id INTEGER DEFAULT NULL REFERENCES interview_categories(id) ON DELETE SET NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_interview_items_category_id ON interview_items(category_id)
    `)
  },
}
