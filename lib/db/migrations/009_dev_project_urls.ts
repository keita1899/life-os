import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration009: Migration = {
  version: 9,
  name: 'dev_project_urls',
  up: async (db: Database) => {
    await db.execute(`
      ALTER TABLE dev_projects ADD COLUMN production_url TEXT DEFAULT NULL
    `)
    await db.execute(`
      ALTER TABLE dev_projects ADD COLUMN github_url TEXT DEFAULT NULL
    `)
  },
}
