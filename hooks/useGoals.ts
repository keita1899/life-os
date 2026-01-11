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
    try {
      await createYearlyGoal(input)
      await mutate(goalsKey)
      await mutate(availableYearsKey)
    } catch (err) {
      throw err
    }
  }

  const handleCreateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
    try {
      await createMonthlyGoal(input)
      await mutate(goalsKey)
      await mutate(availableYearsKey)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteYearlyGoal = async (id: number) => {
    try {
      await deleteYearlyGoal(id)
      await mutate(goalsKey)
      await mutate(availableYearsKey)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    try {
      await deleteMonthlyGoal(id)
      await mutate(goalsKey)
      await mutate(availableYearsKey)
    } catch (err) {
      throw err
    }
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
