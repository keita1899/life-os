import useSWR, { mutate } from 'swr'
import { getDevYearlyAndMonthlyGoalsByYear } from '@/lib/dev/goals/index'
import {
  createDevYearlyGoal,
  updateDevYearlyGoal,
  deleteDevYearlyGoal,
  toggleDevYearlyGoalAchievement,
} from '@/lib/dev/goals/yearly'
import {
  createDevMonthlyGoal,
  updateDevMonthlyGoal,
  deleteDevMonthlyGoal,
  toggleDevMonthlyGoalAchievement,
} from '@/lib/dev/goals/monthly'
import {
  createDevWeeklyGoal,
  updateDevWeeklyGoal,
  deleteDevWeeklyGoal,
  toggleDevWeeklyGoalAchievement,
} from '@/lib/dev/goals/weekly'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
  UpdateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'
import type {
  DevMonthlyGoal,
  CreateDevMonthlyGoalInput,
  UpdateDevMonthlyGoalInput,
} from '@/lib/types/dev-monthly-goal'
import type {
  DevWeeklyGoal,
  CreateDevWeeklyGoalInput,
  UpdateDevWeeklyGoalInput,
} from '@/lib/types/dev-weekly-goal'
import { fetcher } from '@/lib/swr'
import { getYearFromDate } from '@/lib/goals/base'

export function useDevGoals(selectedYear: number) {
  const goalsKey = ['dev-goals', selectedYear]

  const {
    data = { yearlyGoals: [], monthlyGoals: [], weeklyGoals: [] },
    error,
    isLoading,
  } = useSWR<{
    yearlyGoals: DevYearlyGoal[]
    monthlyGoals: DevMonthlyGoal[]
    weeklyGoals: DevWeeklyGoal[]
  }>(goalsKey, () =>
    fetcher(() => getDevYearlyAndMonthlyGoalsByYear(selectedYear)),
  )

  const handleCreateYearlyGoal = async (input: CreateDevYearlyGoalInput) => {
    await createDevYearlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleCreateMonthlyGoal = async (input: CreateDevMonthlyGoalInput) => {
    await createDevMonthlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleCreateWeeklyGoal = async (input: CreateDevWeeklyGoalInput) => {
    await createDevWeeklyGoal(input)
    const yearToRefresh = getYearFromDate(input.weekStartDate)
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteYearlyGoal = async (id: number) => {
    await deleteDevYearlyGoal(id)
    await mutate(goalsKey)
  }

  const handleUpdateYearlyGoal = async (
    id: number,
    input: UpdateDevYearlyGoalInput,
  ) => {
    await updateDevYearlyGoal(id, input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleUpdateMonthlyGoal = async (
    id: number,
    input: UpdateDevMonthlyGoalInput,
  ) => {
    await updateDevMonthlyGoal(id, input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    await deleteDevMonthlyGoal(id)
    await mutate(goalsKey)
  }

  const handleUpdateWeeklyGoal = async (
    id: number,
    input: UpdateDevWeeklyGoalInput,
  ) => {
    await updateDevWeeklyGoal(id, input)
    const yearToRefresh =
      input.year ?? getYearFromDate(input.weekStartDate) ?? selectedYear
    await Promise.all([
      mutate(['dev-goals', yearToRefresh]),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteWeeklyGoal = async (id: number) => {
    await deleteDevWeeklyGoal(id)
    await mutate(goalsKey)
  }

  const handleToggleYearlyGoalAchievement = async (id: number) => {
    await toggleDevYearlyGoalAchievement(id)
    await mutate(goalsKey)
  }

  const handleToggleMonthlyGoalAchievement = async (id: number) => {
    await toggleDevMonthlyGoalAchievement(id)
    await mutate(goalsKey)
  }

  const handleToggleWeeklyGoalAchievement = async (id: number) => {
    await toggleDevWeeklyGoalAchievement(id)
    await mutate(goalsKey)
  }

  return {
    yearlyGoals: data.yearlyGoals,
    monthlyGoals: data.monthlyGoals,
    weeklyGoals: data.weeklyGoals,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev goals'
      : null,
    createYearlyGoal: handleCreateYearlyGoal,
    createMonthlyGoal: handleCreateMonthlyGoal,
    createWeeklyGoal: handleCreateWeeklyGoal,
    updateYearlyGoal: handleUpdateYearlyGoal,
    updateMonthlyGoal: handleUpdateMonthlyGoal,
    updateWeeklyGoal: handleUpdateWeeklyGoal,
    deleteYearlyGoal: handleDeleteYearlyGoal,
    deleteMonthlyGoal: handleDeleteMonthlyGoal,
    deleteWeeklyGoal: handleDeleteWeeklyGoal,
    toggleYearlyGoalAchievement: handleToggleYearlyGoalAchievement,
    toggleMonthlyGoalAchievement: handleToggleMonthlyGoalAchievement,
    toggleWeeklyGoalAchievement: handleToggleWeeklyGoalAchievement,
    refreshGoals: () => mutate(goalsKey),
  }
}
