import type { Migration } from '../migration-runner'

export const migration017: Migration = {
  version: 17,
  name: 'drop_dev_tasks_order_unique',
  up: async (db) => {
    await db.execute('DROP INDEX IF EXISTS dev_tasks_order_unique_null')
    await db.execute('DROP INDEX IF EXISTS dev_tasks_order_unique_notnull')
  },
}
