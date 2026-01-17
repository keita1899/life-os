import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getYearlyAndMonthlyGoalsByYear,
  getAllAvailableYears,
} from '@/lib/goals/index'
import { createYearlyGoal, deleteYearlyGoal } from '@/lib/goals/yearly'
import {
  createMonthlyGoal,
  updateMonthlyGoal,
  deleteMonthlyGoal,
} from '@/lib/goals/monthly'
import {
  createWeeklyGoal,
  updateWeeklyGoal,
  deleteWeeklyGoal,
} from '@/lib/goals/weekly'
import type { YearlyGoal, CreateYearlyGoalInput } from '@/lib/types/yearly-goal'
import type {
  MonthlyGoal,
  CreateMonthlyGoalInput,
  UpdateMonthlyGoalInput,
} from '@/lib/types/monthly-goal'
import type {
  WeeklyGoal,
  CreateWeeklyGoalInput,
  UpdateWeeklyGoalInput,
} from '@/lib/types/weekly-goal'
import { fetcher } from '@/lib/swr'
import { getYearFromDate } from '@/lib/goals/base'

export function useGoals(selectedYear: number) {
  const goalsKey = ['goals', selectedYear]
  const availableYearsKey = 'available-years'

  const {
    data = { yearlyGoals: [], monthlyGoals: [], weeklyGoals: [] },
    error,
    isLoading,
  } = useSWR<{
    yearlyGoals: YearlyGoal[]
    monthlyGoals: MonthlyGoal[]
    weeklyGoals: WeeklyGoal[]
  }>(goalsKey, () =>
    fetcher(() => getYearlyAndMonthlyGoalsByYear(selectedYear)),
  )

  const { data: availableYears = [] } = useSWR<number[]>(
    availableYearsKey,
    () => fetcher(() => getAllAvailableYears()),
  )

  const handleCreateYearlyGoal = async (input: CreateYearlyGoalInput) => {
    await createYearlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleCreateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
    await createMonthlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleCreateWeeklyGoal = async (input: CreateWeeklyGoalInput) => {
    await createWeeklyGoal(input)
    const yearToRefresh = getYearFromDate(input.weekStartDate)
    await Promise.all([
      mutate(['goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteYearlyGoal = async (id: number) => {
    await deleteYearlyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  const handleUpdateMonthlyGoal = async (
    id: number,
    input: UpdateMonthlyGoalInput,
  ) => {
    await updateMonthlyGoal(id, input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([
      mutate(['goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    await deleteMonthlyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  const handleUpdateWeeklyGoal = async (
    id: number,
    input: UpdateWeeklyGoalInput,
  ) => {
    await updateWeeklyGoal(id, input)
    const yearToRefresh =
      input.year ?? getYearFromDate(input.weekStartDate) ?? selectedYear
    await Promise.all([
      mutate(['goals', yearToRefresh]),
      mutate(availableYearsKey),
      yearToRefresh === selectedYear ? Promise.resolve() : mutate(goalsKey),
    ])
  }

  const handleDeleteWeeklyGoal = async (id: number) => {
    await deleteWeeklyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  return {
    yearlyGoals: data.yearlyGoals,
    monthlyGoals: data.monthlyGoals,
    weeklyGoals: data.weeklyGoals,
    availableYears,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch goals'
      : null,
    createYearlyGoal: handleCreateYearlyGoal,
    createMonthlyGoal: handleCreateMonthlyGoal,
    createWeeklyGoal: handleCreateWeeklyGoal,
    updateMonthlyGoal: handleUpdateMonthlyGoal,
    updateWeeklyGoal: handleUpdateWeeklyGoal,
    deleteYearlyGoal: handleDeleteYearlyGoal,
    deleteMonthlyGoal: handleDeleteMonthlyGoal,
    deleteWeeklyGoal: handleDeleteWeeklyGoal,
    refreshGoals: () => mutate(goalsKey),
  }
}
