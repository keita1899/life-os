import type { Migration } from '../migration-runner'

export const migration012: Migration = {
  version: 12,
  name: 'my_rules',
  up: async (db) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS rule_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS rule_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category_id INTEGER,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES rule_categories(id) ON DELETE SET NULL
      )
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_rule_items_category_id ON rule_items(category_id)
    `)
  },
}
