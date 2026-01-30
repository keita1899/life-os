import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getCompletionsByHabitAndMonth,
  getCompletionsByDate,
  createCompletion,
  deleteCompletion,
} from '@/lib/habits'
import type { HabitCompletion } from '@/lib/types/habit-completion'
import { fetcher } from '@/lib/swr'

export function useHabitCompletions(
  habitId: number | null,
  year: number,
  month: number,
) {
  const key =
    habitId !== null
      ? ['habit-completions', habitId, year, month]
      : null

  const {
    data = [],
    error,
    isLoading,
    mutate: mutateCache,
  } = useSWR<HabitCompletion[]>(
    key,
    () =>
      fetcher(() =>
        habitId !== null
          ? getCompletionsByHabitAndMonth(habitId, year, month)
          : Promise.resolve([]),
      ),
  )

  return {
    completions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch habit completions'
      : null,
    refreshCompletions: () => (key ? mutate(key) : undefined),
    mutate: mutateCache,
  }
}

export function useHabitCompletionsByDate(date: string) {
  const key = ['habit-completions-by-date', date]

  const {
    data = [],
    error,
    isLoading,
    mutate: mutateCache,
  } = useSWR<HabitCompletion[]>(key, () =>
    fetcher(() => getCompletionsByDate(date)),
  )

  const handleCreateCompletion = async (
    habitId: number,
    completedDate: string,
  ) => {
    await createCompletion(habitId, completedDate)
    await mutate(key)
    const [y, m] = completedDate.split('-').map(Number)
    await mutate(['habit-completions', habitId, y, m])
  }

  const handleDeleteCompletion = async (
    habitId: number,
    completedDate: string,
  ) => {
    await deleteCompletion(habitId, completedDate)
    await mutate(key)
    const [y, m] = completedDate.split('-').map(Number)
    await mutate(['habit-completions', habitId, y, m])
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
    refreshCompletions: () => mutate(key),
    mutate: mutateCache,
  }
}
