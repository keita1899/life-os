import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration003: Migration = {
  version: 3,
  name: 'tasks_memo',
  up: async (db: Database) => {
    const taskColumnRows = await db.select<{ name?: string; NAME?: string }[]>(
      "SELECT name FROM pragma_table_info('tasks')",
    )
    const taskColumns = new Set(
      taskColumnRows.map((r) => r.name ?? r.NAME ?? ''),
    )
    if (!taskColumns.has('memo')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN memo TEXT')
    }

    const devTaskColumnRows = await db.select<{
      name?: string
      NAME?: string
    }[]>("SELECT name FROM pragma_table_info('dev_tasks')")
    const devTaskColumns = new Set(
      devTaskColumnRows.map((r) => r.name ?? r.NAME ?? ''),
    )
    if (!devTaskColumns.has('memo')) {
      await db.execute('ALTER TABLE dev_tasks ADD COLUMN memo TEXT')
    }
  },
}
