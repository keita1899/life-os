import useSWR from 'swr'
import { mutate } from 'swr'

interface GoalCrudApi {
  fetchGoals: (year: number) => Promise<{
    yearlyGoals: unknown[]
    monthlyGoals: unknown[]
    weeklyGoals: unknown[]
  }>
  createYearlyGoal: (input: Record<string, unknown>) => Promise<unknown>
  createMonthlyGoal: (input: Record<string, unknown>) => Promise<unknown>
  createWeeklyGoal: (input: Record<string, unknown>) => Promise<unknown>
  updateYearlyGoal?: (id: number, input: Record<string, unknown>) => Promise<unknown>
  updateMonthlyGoal: (id: number, input: Record<string, unknown>) => Promise<unknown>
  updateWeeklyGoal: (id: number, input: Record<string, unknown>) => Promise<unknown>
  deleteYearlyGoal: (id: number) => Promise<void>
  deleteMonthlyGoal: (id: number) => Promise<void>
  deleteWeeklyGoal: (id: number) => Promise<void>
  toggleYearlyGoalAchievement: (id: number) => Promise<unknown>
  toggleMonthlyGoalAchievement: (id: number) => Promise<unknown>
  toggleWeeklyGoalAchievement: (id: number) => Promise<unknown>
  getYearFromDate: (date: string | null | undefined) => number
}

interface UseGoalsCoreOptions {
  selectedYear: number
  api: GoalCrudApi
  goalsKey: (year: number) => string | readonly unknown[]
  errorMessage: string
  includeUpdateYearly?: boolean
}

export function useGoalsCore({
  selectedYear,
  api,
  goalsKey,
  errorMessage,
  includeUpdateYearly = false,
}: UseGoalsCoreOptions) {
  const key = goalsKey(selectedYear)

  const {
    data = { yearlyGoals: [], monthlyGoals: [], weeklyGoals: [] },
    error,
    isLoading,
  } = useSWR(key, () => api.fetchGoals(selectedYear))

  const refreshYear = (yearToRefresh: number) =>
    Promise.all([
      mutate(goalsKey(yearToRefresh)),
      yearToRefresh !== selectedYear ? mutate(key) : Promise.resolve(),
    ])

  const handleCreateYearlyGoal = async (input: { year?: number }) => {
    await api.createYearlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleCreateMonthlyGoal = async (input: { year?: number }) => {
    await api.createMonthlyGoal(input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleCreateWeeklyGoal = async (input: { weekStartDate: string }) => {
    await api.createWeeklyGoal(input)
    const yearToRefresh = api.getYearFromDate(input.weekStartDate)
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleDeleteYearlyGoal = async (id: number) => {
    await api.deleteYearlyGoal(id)
    await mutate(key)
  }

  const handleUpdateYearlyGoal = async (
    id: number,
    input: { year?: number },
  ) => {
    if (!api.updateYearlyGoal) return
    await api.updateYearlyGoal(id, input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleUpdateMonthlyGoal = async (
    id: number,
    input: { year?: number },
  ) => {
    await api.updateMonthlyGoal(id, input)
    const yearToRefresh = input.year ?? selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    await api.deleteMonthlyGoal(id)
    await mutate(key)
  }

  const handleUpdateWeeklyGoal = async (
    id: number,
    input: { year?: number; weekStartDate?: string },
  ) => {
    await api.updateWeeklyGoal(id, input)
    const yearToRefresh =
      input.year ?? api.getYearFromDate(input.weekStartDate) ?? selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleDeleteWeeklyGoal = async (id: number) => {
    await api.deleteWeeklyGoal(id)
    await mutate(key)
  }

  const handleToggleYearlyGoalAchievement = async (id: number) => {
    await api.toggleYearlyGoalAchievement(id)
    await mutate(key)
  }

  const handleToggleMonthlyGoalAchievement = async (id: number) => {
    await api.toggleMonthlyGoalAchievement(id)
    await mutate(key)
  }

  const handleToggleWeeklyGoalAchievement = async (id: number) => {
    await api.toggleWeeklyGoalAchievement(id)
    await mutate(key)
  }

  const result: Record<string, unknown> = {
    yearlyGoals: data.yearlyGoals,
    monthlyGoals: data.monthlyGoals,
    weeklyGoals: data.weeklyGoals,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : errorMessage
      : null,
    createYearlyGoal: handleCreateYearlyGoal,
    createMonthlyGoal: handleCreateMonthlyGoal,
    createWeeklyGoal: handleCreateWeeklyGoal,
    updateMonthlyGoal: handleUpdateMonthlyGoal,
    updateWeeklyGoal: handleUpdateWeeklyGoal,
    deleteYearlyGoal: handleDeleteYearlyGoal,
    deleteMonthlyGoal: handleDeleteMonthlyGoal,
    deleteWeeklyGoal: handleDeleteWeeklyGoal,
    toggleYearlyGoalAchievement: handleToggleYearlyGoalAchievement,
    toggleMonthlyGoalAchievement: handleToggleMonthlyGoalAchievement,
    toggleWeeklyGoalAchievement: handleToggleWeeklyGoalAchievement,
    refreshGoals: () => mutate(key),
  }

  if (includeUpdateYearly && api.updateYearlyGoal) {
    result.updateYearlyGoal = handleUpdateYearlyGoal
  }

  return result
}
