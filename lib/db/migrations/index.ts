import type { Migration } from '../migration-runner'
import { migration001 } from './001_initial_schema'
import { migration002 } from './002_performance_indexes'
import { migration003 } from './003_tasks_memo'
import { migration004 } from './004_review_completions'
import { migration005 } from './005_week_review_times'
import { migration006 } from './006_dev_memos'
import { migration007 } from './007_dev_project_requirements'
import { migration008 } from './008_notification_settings'
import { migration009 } from './009_dev_project_urls'
import { migration010 } from './010_dev_memo_title'

export const allMigrations: Migration[] = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
  migration006,
  migration007,
  migration008,
  migration009,
  migration010,
]
