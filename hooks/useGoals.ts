import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getYearlyAndMonthlyGoalsByYear,
  getAllAvailableYears,
} from '@/lib/goals/index'
import { createYearlyGoal, deleteYearlyGoal } from '@/lib/goals/yearly'
import { createMonthlyGoal, deleteMonthlyGoal } from '@/lib/goals/monthly'
import type { YearlyGoal, CreateYearlyGoalInput } from '@/lib/types/yearly-goal'
import type {
  MonthlyGoal,
  CreateMonthlyGoalInput,
} from '@/lib/types/monthly-goal'
import { fetcher } from '@/lib/swr'

export function useGoals(selectedYear: number) {
  const goalsKey = ['goals', selectedYear]
  const availableYearsKey = 'available-years'

  const {
    data = { yearlyGoals: [], monthlyGoals: [] },
    error,
    isLoading,
  } = useSWR<{ yearlyGoals: YearlyGoal[]; monthlyGoals: MonthlyGoal[] }>(
    goalsKey,
    () => fetcher(() => getYearlyAndMonthlyGoalsByYear(selectedYear)),
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

  const handleDeleteYearlyGoal = async (id: number) => {
    await deleteYearlyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    await deleteMonthlyGoal(id)
    await Promise.all([mutate(goalsKey), mutate(availableYearsKey)])
  }

  return {
    yearlyGoals: data.yearlyGoals,
    monthlyGoals: data.monthlyGoals,
    availableYears,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch goals'
      : null,
    createYearlyGoal: handleCreateYearlyGoal,
    createMonthlyGoal: handleCreateMonthlyGoal,
    deleteYearlyGoal: handleDeleteYearlyGoal,
    deleteMonthlyGoal: handleDeleteMonthlyGoal,
    refreshGoals: () => mutate(goalsKey),
  }
}
