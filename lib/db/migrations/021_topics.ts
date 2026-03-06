import type { Migration } from '../migration-runner'

export const migration021: Migration = {
  version: 21,
  name: 'topics',
  up: async (db) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS topic_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS topic_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT DEFAULT NULL,
        category_id INTEGER DEFAULT NULL REFERENCES topic_categories(id) ON DELETE SET NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
  },
}
