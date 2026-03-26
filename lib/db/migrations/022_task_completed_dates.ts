import type { Migration } from '../migration-runner'

export const migration022: Migration = {
  version: 22,
  name: 'task_completed_dates',
  up: async (db) => {
    await db.execute(
      `ALTER TABLE tasks ADD COLUMN recurrence_completed_dates TEXT`,
    )
  },
}
