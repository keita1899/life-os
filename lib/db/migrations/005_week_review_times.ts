import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration005: Migration = {
  version: 5,
  name: 'week_review_times',
  up: async (db: Database) => {
    await db.execute(`
      ALTER TABLE user_settings ADD COLUMN week_start_review_time TEXT
    `)
    await db.execute(`
      ALTER TABLE user_settings ADD COLUMN week_end_review_time TEXT
    `)
  },
}
