import type { Migration } from '../migration-runner'
import { migration001 } from './001_initial_schema'
import { migration002 } from './002_performance_indexes'

export const allMigrations: Migration[] = [
  migration001,
  migration002,
]
