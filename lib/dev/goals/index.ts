import { getDatabase } from '../../db'
import { getDevYearlyGoalsByYear } from './yearly'
import type { DevYearlyGoal } from '../../types/dev-yearly-goal'

export async function getDevYearlyGoalsByYearOnly(
  year: number,
): Promise<DevYearlyGoal[]> {
  return getDevYearlyGoalsByYear(year)
}

export async function getAllAvailableDevYears(): Promise<number[]> {
  const db = await getDatabase()

  try {
    const yearlyYears = await db.select<{ year: number }[]>(
      'SELECT DISTINCT year FROM dev_yearly_goals',
    )

    const years = new Set(yearlyYears.map((r) => r.year))

    return Array.from(years).sort((a, b) => b - a)
  } catch (err) {
    throw new Error('Failed to get available dev years')
  }
}

export * from './yearly'
