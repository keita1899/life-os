import type { Migration } from '../migration-runner'
import { migration001 } from './001_initial_schema'
import { migration002 } from './002_performance_indexes'
import { migration003 } from './003_tasks_memo'
import { migration004 } from './004_review_completions'
import { migration005 } from './005_week_review_times'

export const allMigrations: Migration[] = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
]
