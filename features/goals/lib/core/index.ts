import { DB_COLUMNS } from '@/lib/db/constants'
import type { GoalsTableConfig } from './config'

export const LIFE_GOALS_CONFIG: GoalsTableConfig = {
  yearly: { table: 'yearly_goals', columns: DB_COLUMNS.YEARLY_GOALS },
  monthly: { table: 'monthly_goals', columns: DB_COLUMNS.MONTHLY_GOALS },
  weekly: { table: 'weekly_goals', columns: DB_COLUMNS.WEEKLY_GOALS },
  errorContext: 'goals',
}

export const DEV_GOALS_CONFIG: GoalsTableConfig = {
  yearly: { table: 'dev_yearly_goals', columns: DB_COLUMNS.DEV_YEARLY_GOALS },
  monthly: {
    table: 'dev_monthly_goals',
    columns: DB_COLUMNS.DEV_MONTHLY_GOALS,
  },
  weekly: {
    table: 'dev_weekly_goals',
    columns: DB_COLUMNS.DEV_WEEKLY_GOALS,
  },
  errorContext: 'dev goals',
}

export { createYearlyGoalsApi } from './yearly'
export { createMonthlyGoalsApi } from './monthly'
export { createWeeklyGoalsApi } from './weekly'
export type { GoalsTableConfig } from './config'
export type * from './types'
