import useSWR, { useSWRConfig } from 'swr'
import {
  getCompletionsByHabitAndMonth,
  getCompletionsByDate,
  getCompletionsByHabitAndDateRange,
  createCompletion,
  deleteCompletion,
} from '../lib'
import type { HabitCompletion } from '../types/habit-completion'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useHabitCompletions(
  habitId: number | null,
  year: number,
  month: number,
) {
  const key =
    habitId !== null ? SWR_KEYS.habitCompletionsByMonth(habitId, year, month) : null

  const {
    data = [],
    error,
    isLoading,
    mutate: mutateCache,
  } = useSWR<HabitCompletion[]>(
    key,
    () =>
      habitId !== null
        ? getCompletionsByHabitAndMonth(habitId, year, month)
        : Promise.resolve([]),
  )

  return {
    completions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch habit completions'
      : null,
    refreshCompletions: () => (key ? mutateCache() : undefined),
    mutate: mutateCache,
  }
}

export function useHabitCompletionsByDate(date: string) {
  const key = SWR_KEYS.habitCompletionsByDate(date)
  const { mutate } = useSWRConfig()

  const {
    data = [],
    error,
    isLoading,
    mutate: mutateCache,
  } = useSWR<HabitCompletion[]>(key, () =>
    getCompletionsByDate(date),
  )

  const handleCreateCompletion = async (
    habitId: number,
    completedDate: string,
  ) => {
    const optimisticCompletion: HabitCompletion = {
      id: -1,
      habitId,
      completedDate,
      createdAt: new Date().toISOString(),
    }

    await mutateCache(
      async (current: HabitCompletion[] | undefined) => {
        const newCompletion = await createCompletion(habitId, completedDate)
        return [...(current ?? []), newCompletion]
      },
      {
        optimisticData: (current: HabitCompletion[] | undefined) => [
          ...(current ?? []),
          optimisticCompletion,
        ],
        revalidate: false,
        rollbackOnError: true,
      },
    )

    const [y, m] = completedDate.split('-').map(Number)
    await mutate(SWR_KEYS.habitCompletionsByMonth(habitId, y, m))
  }

  const handleDeleteCompletion = async (
    habitId: number,
    completedDate: string,
  ) => {
    await mutateCache(
      async (current: HabitCompletion[] | undefined) => {
        await deleteCompletion(habitId, completedDate)
        return (current ?? []).filter(
          (c) => !(c.habitId === habitId && c.completedDate === completedDate),
        )
      },
      {
        optimisticData: (current: HabitCompletion[] | undefined) =>
          (current ?? []).filter(
            (c) =>
              !(c.habitId === habitId && c.completedDate === completedDate),
          ),
        revalidate: false,
        rollbackOnError: true,
      },
    )

    const [y, m] = completedDate.split('-').map(Number)
    await mutate(SWR_KEYS.habitCompletionsByMonth(habitId, y, m))
  }

  return {
    completions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch habit completions'
      : null,
    createCompletion: handleCreateCompletion,
    deleteCompletion: handleDeleteCompletion,
    refreshCompletions: () => mutateCache(),
    mutate: mutateCache,
  }
}

export function useHabitCompletionsByDateRange(
  habitId: number | null,
  startDateStr: string,
  endDateStr: string,
) {
  const key =
    habitId !== null
      ? SWR_KEYS.habitCompletionsByDateRange(
          habitId,
          startDateStr,
          endDateStr,
        )
      : null

  const {
    data = [],
    isLoading,
    error,
  } = useSWR<HabitCompletion[]>(
    key,
    () =>
      habitId !== null
        ? getCompletionsByHabitAndDateRange(
            habitId,
            startDateStr,
            endDateStr,
          )
        : Promise.resolve([]),
  )

  return {
    completions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch habit completions'
      : null,
  }
}
