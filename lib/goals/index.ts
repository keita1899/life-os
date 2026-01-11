import { getDatabase } from '../db'
import { getYearlyGoalsByYear } from './yearly'
import { getMonthlyGoalsByYear } from './monthly'
import type { YearlyGoal } from '../types/yearly-goal'
import type { MonthlyGoal } from '../types/monthly-goal'

export async function getYearlyAndMonthlyGoalsByYear(year: number): Promise<{
  yearlyGoals: YearlyGoal[]
  monthlyGoals: MonthlyGoal[]
}> {
  const [yearlyGoals, monthlyGoals] = await Promise.all([
    getYearlyGoalsByYear(year),
    getMonthlyGoalsByYear(year),
  ])

  return { yearlyGoals, monthlyGoals }
}

export async function getAllAvailableYears(): Promise<number[]> {
  const db = await getDatabase()

  const yearlyYears = await db.select<{ year: number }[]>(
    'SELECT DISTINCT year FROM yearly_goals',
  )
  const monthlyYears = await db.select<{ year: number }[]>(
    'SELECT DISTINCT year FROM monthly_goals',
  )

  const years = new Set([
    ...yearlyYears.map((r) => r.year),
    ...monthlyYears.map((r) => r.year),
  ])

  return Array.from(years).sort((a, b) => b - a)
}

export * from './yearly'
export * from './monthly'
