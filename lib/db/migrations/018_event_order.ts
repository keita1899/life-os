import type { Migration } from '../migration-runner'

export const migration018: Migration = {
  version: 18,
  name: 'event_order',
  up: async (db) => {
    await db.execute(
      'ALTER TABLE events ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0',
    )
    // 既存行を id 順で初期値設定
    await db.execute(
      `UPDATE events SET "order" = (
        SELECT COUNT(*) FROM events AS t2 WHERE t2.id <= events.id
      )`,
    )
  },
}
