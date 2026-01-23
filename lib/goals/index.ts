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

export * from './yearly'
export * from './monthly'
export * from './weekly'
