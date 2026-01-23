import useSWR, { mutate } from 'swr'
import {
  getDevYearlyAndMonthlyGoalsByYear,
  getAllAvailableDevYears,
} from '@/lib/dev/goals/index'
import {
  createDevYearlyGoal,
  deleteDevYearlyGoal,
  toggleDevYearlyGoalAchievement,
} from '@/lib/dev/goals/yearly'
import {
  createDevMonthlyGoal,
  updateDevMonthlyGoal,
  deleteDevMonthlyGoal,
  toggleDevMonthlyGoalAchievement,
} from '@/lib/dev/goals/monthly'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'
import type {
  DevMonthlyGoal,
  CreateDevMonthlyGoalInput,
  UpdateDevMonthlyGoalInput,
} from '@/lib/types/dev-monthly-goal'
import { fetcher } from '@/lib/swr'

export function useDevGoals(selectedYear: number) {
  const goalsKey = ['dev-goals', selectedYear]
  const availableYearsKey = 'dev-available-years'

  const {
    data = { yearlyGoals: [], monthlyGoals: [] },
    error,
    isLoading,
  } = useSWR<{
    yearlyGoals: DevYearlyGoal[]
    monthlyGoals: DevMonthlyGoal[]
  }>(goalsKey, () =>
    fetcher(() => getDevYearlyAndMonthlyGoalsByYear(selectedYear)),
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

  const handleCreateMonthlyGoal = async (input: CreateDevMonthlyGoalInput) => {
    await createDevMonthlyGoal(input)
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

  const handleUpdateMonthlyGoal = async (
    id: number,
    input: UpdateDevMonthlyGoalInput,
  ) => {
    await updateDevMonthlyGoal(id, input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    await deleteDevMonthlyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  const handleToggleYearlyGoalAchievement = async (id: number) => {
    await toggleDevYearlyGoalAchievement(id)
    await mutate(goalsKey)
  }

  const handleToggleMonthlyGoalAchievement = async (id: number) => {
    await toggleDevMonthlyGoalAchievement(id)
    await mutate(goalsKey)
  }

  return {
    yearlyGoals: data.yearlyGoals,
    monthlyGoals: data.monthlyGoals,
    availableYears,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev goals'
      : null,
    createYearlyGoal: handleCreateYearlyGoal,
    createMonthlyGoal: handleCreateMonthlyGoal,
    updateMonthlyGoal: handleUpdateMonthlyGoal,
    deleteYearlyGoal: handleDeleteYearlyGoal,
    deleteMonthlyGoal: handleDeleteMonthlyGoal,
    toggleYearlyGoalAchievement: handleToggleYearlyGoalAchievement,
    toggleMonthlyGoalAchievement: handleToggleMonthlyGoalAchievement,
    refreshGoals: () => mutate(goalsKey),
  }
}
