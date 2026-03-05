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
import { migration011 } from './011_interview_qa'
import { migration012 } from './012_my_rules'
import { migration013 } from './013_dev_project_db_designs'
import { migration014 } from './014_weekday_themes'
import { migration015 } from './015_category_sort_order'
import { migration016 } from './016_subscription_order'
import { migration017 } from './017_drop_dev_tasks_order_unique'
import { migration018 } from './018_event_order'

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
  migration011,
  migration012,
  migration013,
  migration014,
  migration015,
  migration016,
  migration017,
  migration018,
]
