import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration010: Migration = {
  version: 10,
  name: 'dev_memo_title',
  up: async (db: Database) => {
    await db.execute(`
      ALTER TABLE dev_memos ADD COLUMN title TEXT DEFAULT NULL
    `)
  },
}
