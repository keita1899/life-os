import { getDatabase } from '../../db'
import { getDevYearlyGoalsByYear } from './yearly'
import { getDevMonthlyGoalsByYear } from './monthly'
import type { DevYearlyGoal } from '../../types/dev-yearly-goal'
import type { DevMonthlyGoal } from '../../types/dev-monthly-goal'

export async function getDevYearlyGoalsByYearOnly(
  year: number,
): Promise<DevYearlyGoal[]> {
  return getDevYearlyGoalsByYear(year)
}

export async function getDevMonthlyGoalsByYearOnly(
  year: number,
): Promise<DevMonthlyGoal[]> {
  return getDevMonthlyGoalsByYear(year)
}

export async function getDevYearlyAndMonthlyGoalsByYear(year: number): Promise<{
  yearlyGoals: DevYearlyGoal[]
  monthlyGoals: DevMonthlyGoal[]
}> {
  const [yearlyGoals, monthlyGoals] = await Promise.all([
    getDevYearlyGoalsByYear(year),
    getDevMonthlyGoalsByYear(year),
  ])

  return {
    yearlyGoals,
    monthlyGoals,
  }
}

export async function getAllAvailableDevYears(): Promise<number[]> {
  const db = await getDatabase()

  try {
    const yearlyYears = await db.select<{ year: number }[]>(
      'SELECT DISTINCT year FROM dev_yearly_goals',
    )

    const monthlyYears = await db.select<{ year: number }[]>(
      'SELECT DISTINCT year FROM dev_monthly_goals',
    )

    const years = new Set([
      ...yearlyYears.map((r) => r.year),
      ...monthlyYears.map((r) => r.year),
    ])

    return Array.from(years).sort((a, b) => b - a)
  } catch (err) {
    throw new Error('Failed to get available dev years')
  }
}

export * from './yearly'
export * from './monthly'
