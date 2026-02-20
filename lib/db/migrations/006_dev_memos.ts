import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration006: Migration = {
  version: 6,
  name: 'dev_memos',
  up: async (db: Database) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        project_id INTEGER,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES dev_projects(id) ON DELETE SET NULL
      )
    `)
    await db.execute(
      'CREATE INDEX IF NOT EXISTS idx_dev_memos_project_id ON dev_memos(project_id)',
    )
    await db.execute(
      'CREATE INDEX IF NOT EXISTS idx_dev_memos_created_at ON dev_memos(created_at DESC)',
    )
  },
}
