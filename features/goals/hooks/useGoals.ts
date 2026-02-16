import { getYearlyAndMonthlyGoalsByYear } from '../lib'
import {
  createYearlyGoal,
  deleteYearlyGoal,
  toggleYearlyGoalAchievement,
} from '../lib/yearly'
import {
  createMonthlyGoal,
  updateMonthlyGoal,
  deleteMonthlyGoal,
  toggleMonthlyGoalAchievement,
} from '../lib/monthly'
import {
  createWeeklyGoal,
  updateWeeklyGoal,
  deleteWeeklyGoal,
  toggleWeeklyGoalAchievement,
} from '../lib/weekly'
import { getYearFromDate } from '../lib/base'
import { SWR_KEYS } from '@/lib/swr-keys'
import { useGoalsCore } from './useGoalsCore'
import type { YearlyGoal } from '../types/yearly-goal'
import type { MonthlyGoal } from '../types/monthly-goal'
import type { WeeklyGoal } from '../types/weekly-goal'

export function useGoals(selectedYear: number) {
  return useGoalsCore({
    selectedYear,
    api: {
      fetchGoals: getYearlyAndMonthlyGoalsByYear,
      createYearlyGoal: createYearlyGoal as unknown as (input: Record<string, unknown>) => Promise<unknown>,
      createMonthlyGoal: createMonthlyGoal as unknown as (input: Record<string, unknown>) => Promise<unknown>,
      createWeeklyGoal: createWeeklyGoal as unknown as (input: Record<string, unknown>) => Promise<unknown>,
      updateMonthlyGoal: updateMonthlyGoal as unknown as (id: number, input: Record<string, unknown>) => Promise<unknown>,
      updateWeeklyGoal: updateWeeklyGoal as unknown as (id: number, input: Record<string, unknown>) => Promise<unknown>,
      deleteYearlyGoal,
      deleteMonthlyGoal,
      deleteWeeklyGoal,
      toggleYearlyGoalAchievement: toggleYearlyGoalAchievement as unknown as (id: number) => Promise<unknown>,
      toggleMonthlyGoalAchievement: toggleMonthlyGoalAchievement as unknown as (id: number) => Promise<unknown>,
      toggleWeeklyGoalAchievement: toggleWeeklyGoalAchievement as unknown as (id: number) => Promise<unknown>,
      getYearFromDate,
    },
    goalsKey: SWR_KEYS.goals,
    errorMessage: 'Failed to fetch goals',
  }) as {
    yearlyGoals: YearlyGoal[]
    monthlyGoals: MonthlyGoal[]
    weeklyGoals: WeeklyGoal[]
    isLoading: boolean
    error: string | null
    createYearlyGoal: (input: unknown) => Promise<void>
    createMonthlyGoal: (input: unknown) => Promise<void>
    createWeeklyGoal: (input: unknown) => Promise<void>
    updateMonthlyGoal: (id: number, input: unknown) => Promise<void>
    updateWeeklyGoal: (id: number, input: unknown) => Promise<void>
    deleteYearlyGoal: (id: number) => Promise<void>
    deleteMonthlyGoal: (id: number) => Promise<void>
    deleteWeeklyGoal: (id: number) => Promise<void>
    toggleYearlyGoalAchievement: (id: number) => Promise<void>
    toggleMonthlyGoalAchievement: (id: number) => Promise<void>
    toggleWeeklyGoalAchievement: (id: number) => Promise<void>
    refreshGoals: () => void
  }
}
