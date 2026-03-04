import type { Migration } from '../migration-runner'

const CATEGORY_TABLES = [
  'bucket_list_categories',
  'wishlist_categories',
  'vision_categories',
  'rule_categories',
  'interview_categories',
] as const

export const migration015: Migration = {
  version: 15,
  name: 'category_sort_order',
  up: async (db) => {
    for (const table of CATEGORY_TABLES) {
      await db.execute(
        `ALTER TABLE ${table} ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`,
      )
      // 既存行を id 順で初期値設定
      await db.execute(
        `UPDATE ${table} SET sort_order = (
          SELECT COUNT(*) FROM ${table} AS t2 WHERE t2.id <= ${table}.id
        )`,
      )
    }
  },
}
