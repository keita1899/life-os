import useSWR, { mutate } from 'swr'
import {
  getDevYearlyGoalsByYearOnly,
  getAllAvailableDevYears,
} from '@/lib/dev/goals/index'
import {
  createDevYearlyGoal,
  deleteDevYearlyGoal,
  toggleDevYearlyGoalAchievement,
} from '@/lib/dev/goals/yearly'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'
import { fetcher } from '@/lib/swr'

export function useDevGoals(selectedYear: number) {
  const goalsKey = ['dev-goals', selectedYear]
  const availableYearsKey = 'dev-available-years'

  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevYearlyGoal[]>(goalsKey, () =>
    fetcher(() => getDevYearlyGoalsByYearOnly(selectedYear)),
  )

  const { data: availableYears = [] } = useSWR<number[]>(
    availableYearsKey,
    () => fetcher(() => getAllAvailableDevYears()),
  )

  const handleCreateYearlyGoal = async (input: CreateDevYearlyGoalInput) => {
    await createDevYearlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteYearlyGoal = async (id: number) => {
    await deleteDevYearlyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  const handleToggleYearlyGoalAchievement = async (id: number) => {
    await toggleDevYearlyGoalAchievement(id)
    await mutate(goalsKey)
  }

  return {
    yearlyGoals: data,
    availableYears,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev goals'
      : null,
    createYearlyGoal: handleCreateYearlyGoal,
    deleteYearlyGoal: handleDeleteYearlyGoal,
    toggleYearlyGoalAchievement: handleToggleYearlyGoalAchievement,
    refreshGoals: () => mutate(goalsKey),
  }
}
