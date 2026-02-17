import type { Migration } from '../migration-runner'
import { migration001 } from './001_initial_schema'
import { migration002 } from './002_performance_indexes'
import { migration003 } from './003_tasks_memo'

export const allMigrations: Migration[] = [
  migration001,
  migration002,
  migration003,
]
