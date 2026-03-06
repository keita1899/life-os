import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration020: Migration = {
  version: 20,
  name: 'dev_memos_category',
  up: async (db: Database) => {
    await db.execute(`
      ALTER TABLE dev_memos ADD COLUMN category TEXT DEFAULT NULL
    `)
  },
}
