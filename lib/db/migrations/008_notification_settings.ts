import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration008: Migration = {
  version: 8,
  name: 'notification_settings',
  up: async (db: Database) => {
    // SQLite の ALTER TABLE は暗黙コミットされるためトランザクションで囲まない
    await db.execute(`
      ALTER TABLE user_settings ADD COLUMN notify_events INTEGER NOT NULL DEFAULT 1
    `)
    await db.execute(`
      ALTER TABLE user_settings ADD COLUMN notify_tasks INTEGER NOT NULL DEFAULT 1
    `)
    await db.execute(`
      ALTER TABLE user_settings ADD COLUMN notify_habits INTEGER NOT NULL DEFAULT 1
    `)
    await db.execute(`
      ALTER TABLE user_settings ADD COLUMN notify_minutes_before INTEGER NOT NULL DEFAULT 5
    `)
  },
}
