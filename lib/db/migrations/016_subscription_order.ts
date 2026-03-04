import type { Migration } from '../migration-runner'

export const migration016: Migration = {
  version: 16,
  name: 'subscription_order',
  up: async (db) => {
    await db.execute(
      'ALTER TABLE subscriptions ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0',
    )
    // 既存行を id 順で初期値設定
    await db.execute(
      `UPDATE subscriptions SET "order" = (
        SELECT COUNT(*) FROM subscriptions AS t2 WHERE t2.id <= subscriptions.id
      )`,
    )
  },
}
