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

export interface UseGoalsCoreReturn<TYearly, TMonthly, TWeekly> {
  yearlyGoals: TYearly[]
  monthlyGoals: TMonthly[]
  weeklyGoals: TWeekly[]
  isLoading: boolean
  error: string | null
  createYearlyGoal: (input: object) => Promise<void>
  createMonthlyGoal: (input: object) => Promise<void>
  createWeeklyGoal: (input: object) => Promise<void>
  updateMonthlyGoal: (id: number, input: object) => Promise<void>
  updateWeeklyGoal: (id: number, input: object) => Promise<void>
  deleteYearlyGoal: (id: number) => Promise<void>
  deleteMonthlyGoal: (id: number) => Promise<void>
  deleteWeeklyGoal: (id: number) => Promise<void>
  toggleYearlyGoalAchievement: (id: number) => Promise<void>
  toggleMonthlyGoalAchievement: (id: number) => Promise<void>
  toggleWeeklyGoalAchievement: (id: number) => Promise<void>
  refreshGoals: () => void
  updateYearlyGoal?: (id: number, input: object) => Promise<void>
}

export function useGoalsCore<TYearly = unknown, TMonthly = unknown, TWeekly = unknown>({
  selectedYear,
  api,
  goalsKey,
  errorMessage,
  includeUpdateYearly = false,
}: UseGoalsCoreOptions): UseGoalsCoreReturn<TYearly, TMonthly, TWeekly> {
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

  const handleCreateYearlyGoal = async (input: object) => {
    const r = input as Record<string, unknown>
    await api.createYearlyGoal(r)
    const yearToRefresh = typeof r.year === 'number' ? r.year : selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleCreateMonthlyGoal = async (input: object) => {
    const r = input as Record<string, unknown>
    await api.createMonthlyGoal(r)
    const yearToRefresh = typeof r.year === 'number' ? r.year : selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleCreateWeeklyGoal = async (input: object) => {
    const r = input as Record<string, unknown>
    await api.createWeeklyGoal(r)
    const date = r.weekStartDate
    const yearToRefresh = api.getYearFromDate(
      typeof date === 'string' || date == null ? date : undefined,
    )
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleDeleteYearlyGoal = async (id: number) => {
    await api.deleteYearlyGoal(id)
    await mutate(key)
  }

  const handleUpdateYearlyGoal = async (id: number, input: object) => {
    if (!api.updateYearlyGoal) return
    const r = input as Record<string, unknown>
    await api.updateYearlyGoal(id, r)
    const yearToRefresh = typeof r.year === 'number' ? r.year : selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleUpdateMonthlyGoal = async (id: number, input: object) => {
    const r = input as Record<string, unknown>
    await api.updateMonthlyGoal(id, r)
    const yearToRefresh = typeof r.year === 'number' ? r.year : selectedYear
    await Promise.all([refreshYear(yearToRefresh), mutate(key)])
  }

  const handleDeleteMonthlyGoal = async (id: number) => {
    await api.deleteMonthlyGoal(id)
    await mutate(key)
  }

  const handleUpdateWeeklyGoal = async (id: number, input: object) => {
    const r = input as Record<string, unknown>
    await api.updateWeeklyGoal(id, r)
    const year =
      typeof r.year === 'number'
        ? r.year
        : api.getYearFromDate(
            typeof r.weekStartDate === 'string' || r.weekStartDate == null
              ? r.weekStartDate
              : undefined,
          )
    const yearToRefresh = year ?? selectedYear
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

  const result: UseGoalsCoreReturn<TYearly, TMonthly, TWeekly> = {
    yearlyGoals: data.yearlyGoals as TYearly[],
    monthlyGoals: data.monthlyGoals as TMonthly[],
    weeklyGoals: data.weeklyGoals as TWeekly[],
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
