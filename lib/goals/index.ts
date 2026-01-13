import { getDatabase } from '../db'
import { getYearlyGoalsByYear } from './yearly'
import { getMonthlyGoalsByYear } from './monthly'
import { getWeeklyGoalsByYear } from './weekly'
import type { YearlyGoal } from '../types/yearly-goal'
import type { MonthlyGoal } from '../types/monthly-goal'
import type { WeeklyGoal } from '../types/weekly-goal'

export async function getYearlyAndMonthlyGoalsByYear(year: number): Promise<{
  yearlyGoals: YearlyGoal[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
}> {
  const [yearlyGoals, monthlyGoals, weeklyGoals] = await Promise.all([
    getYearlyGoalsByYear(year),
    getMonthlyGoalsByYear(year),
    getWeeklyGoalsByYear(year),
  ])

  return { yearlyGoals, monthlyGoals, weeklyGoals }
}

export async function getAllAvailableYears(): Promise<number[]> {
  const db = await getDatabase()

  const yearlyYears = await db.select<{ year: number }[]>(
    'SELECT DISTINCT year FROM yearly_goals',
  )
  const monthlyYears = await db.select<{ year: number }[]>(
    'SELECT DISTINCT year FROM monthly_goals',
  )
  const weeklyYears = await db.select<{ year: number }[]>(
    'SELECT DISTINCT year FROM weekly_goals',
  )

  const years = new Set([
    ...yearlyYears.map((r) => r.year),
    ...monthlyYears.map((r) => r.year),
    ...weeklyYears.map((r) => r.year),
  ])

  return Array.from(years).sort((a, b) => b - a)
}

export * from './yearly'
export * from './monthly'
export * from './weekly'
