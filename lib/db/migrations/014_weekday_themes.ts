import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration014: Migration = {
  version: 14,
  name: 'weekday_themes',
  up: async (db: Database) => {
    await db.execute(
      `ALTER TABLE user_settings ADD COLUMN life_weekday_themes TEXT DEFAULT '{}'`,
    )
    await db.execute(
      `ALTER TABLE user_settings ADD COLUMN dev_weekday_themes TEXT DEFAULT '{}'`,
    )
  },
}
