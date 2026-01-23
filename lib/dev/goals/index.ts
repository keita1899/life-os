import { getDevYearlyGoalsByYear } from './yearly'
import { getDevMonthlyGoalsByYear } from './monthly'
import { getDevWeeklyGoalsByYear } from './weekly'
import type { DevYearlyGoal } from '../../types/dev-yearly-goal'
import type { DevMonthlyGoal } from '../../types/dev-monthly-goal'
import type { DevWeeklyGoal } from '../../types/dev-weekly-goal'

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
  weeklyGoals: DevWeeklyGoal[]
}> {
  const [yearlyGoals, monthlyGoals, weeklyGoals] = await Promise.all([
    getDevYearlyGoalsByYear(year),
    getDevMonthlyGoalsByYear(year),
    getDevWeeklyGoalsByYear(year),
  ])

  return {
    yearlyGoals,
    monthlyGoals,
    weeklyGoals,
  }
}

export * from './yearly'
export * from './monthly'
export * from './weekly'
