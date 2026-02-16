import { getDevYearlyAndMonthlyGoalsByYear } from '../lib'
import {
  createDevYearlyGoal,
  updateDevYearlyGoal,
  deleteDevYearlyGoal,
  toggleDevYearlyGoalAchievement,
} from '../lib/yearly'
import {
  createDevMonthlyGoal,
  updateDevMonthlyGoal,
  deleteDevMonthlyGoal,
  toggleDevMonthlyGoalAchievement,
} from '../lib/monthly'
import {
  createDevWeeklyGoal,
  updateDevWeeklyGoal,
  deleteDevWeeklyGoal,
  toggleDevWeeklyGoalAchievement,
} from '../lib/weekly'
import { getYearFromDate } from '@/features/goals'
import { SWR_KEYS } from '@/lib/swr-keys'
import { useGoalsCore } from '@/features/goals/hooks/useGoalsCore'
import type { DevYearlyGoal } from '../types/dev-yearly-goal'
import type { DevMonthlyGoal } from '../types/dev-monthly-goal'
import type { DevWeeklyGoal } from '../types/dev-weekly-goal'

export function useDevGoals(selectedYear: number) {
  return useGoalsCore({
    selectedYear,
    api: {
      fetchGoals: getDevYearlyAndMonthlyGoalsByYear,
      createYearlyGoal: createDevYearlyGoal as unknown as (input: Record<string, unknown>) => Promise<unknown>,
      createMonthlyGoal: createDevMonthlyGoal as unknown as (input: Record<string, unknown>) => Promise<unknown>,
      createWeeklyGoal: createDevWeeklyGoal as unknown as (input: Record<string, unknown>) => Promise<unknown>,
      updateYearlyGoal: updateDevYearlyGoal as unknown as (id: number, input: Record<string, unknown>) => Promise<unknown>,
      updateMonthlyGoal: updateDevMonthlyGoal as unknown as (id: number, input: Record<string, unknown>) => Promise<unknown>,
      updateWeeklyGoal: updateDevWeeklyGoal as unknown as (id: number, input: Record<string, unknown>) => Promise<unknown>,
      deleteYearlyGoal: deleteDevYearlyGoal,
      deleteMonthlyGoal: deleteDevMonthlyGoal,
      deleteWeeklyGoal: deleteDevWeeklyGoal,
      toggleYearlyGoalAchievement: toggleDevYearlyGoalAchievement as unknown as (id: number) => Promise<unknown>,
      toggleMonthlyGoalAchievement: toggleDevMonthlyGoalAchievement as unknown as (id: number) => Promise<unknown>,
      toggleWeeklyGoalAchievement: toggleDevWeeklyGoalAchievement as unknown as (id: number) => Promise<unknown>,
      getYearFromDate,
    },
    goalsKey: SWR_KEYS.devGoals,
    errorMessage: 'Failed to fetch dev goals',
    includeUpdateYearly: true,
  }) as {
    yearlyGoals: DevYearlyGoal[]
    monthlyGoals: DevMonthlyGoal[]
    weeklyGoals: DevWeeklyGoal[]
    isLoading: boolean
    error: string | null
    createYearlyGoal: (input: unknown) => Promise<void>
    createMonthlyGoal: (input: unknown) => Promise<void>
    createWeeklyGoal: (input: unknown) => Promise<void>
    updateYearlyGoal: (id: number, input: unknown) => Promise<void>
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
