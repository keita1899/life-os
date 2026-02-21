import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration007: Migration = {
  version: 7,
  name: 'dev_project_requirements',
  up: async (db: Database) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_project_requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL UNIQUE,
        content TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES dev_projects(id) ON DELETE CASCADE
      )
    `)
    await db.execute(
      'CREATE INDEX IF NOT EXISTS idx_dev_project_requirements_project_id ON dev_project_requirements(project_id)',
    )
  },
}
