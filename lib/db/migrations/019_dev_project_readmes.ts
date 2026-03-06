import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration019: Migration = {
  version: 19,
  name: 'dev_project_readmes',
  up: async (db: Database) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_project_readmes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL UNIQUE,
        content TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES dev_projects(id) ON DELETE CASCADE
      )
    `)
  },
}
