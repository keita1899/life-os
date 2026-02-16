import useSWR, { useSWRConfig } from 'swr'
import {
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
} from '../lib'
import type { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useHabits() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Habit[]>(SWR_KEYS.habits, () => getAllHabits())
  const { mutate } = useSWRConfig()

  const handleCreateHabit = async (input: CreateHabitInput) => {
    const result = await createHabit(input)
    await mutate(
      SWR_KEYS.habits,
      (current: Habit[] | undefined) => [...(current ?? []), result],
      { revalidate: false },
    )
    return result
  }

  const handleUpdateHabit = async (id: number, input: UpdateHabitInput) => {
    const result = await updateHabit(id, input)
    await mutate(
      SWR_KEYS.habits,
      (current: Habit[] | undefined) =>
        (current ?? []).map((h) => (h.id === id ? result : h)),
      { revalidate: false },
    )
    return result
  }

  const handleDeleteHabit = async (id: number) => {
    await mutate(
      SWR_KEYS.habits,
      async (current: Habit[] | undefined) => {
        await deleteHabit(id)
        return (current ?? []).filter((h) => h.id !== id)
      },
      {
        optimisticData: (current: Habit[] | undefined) =>
          (current ?? []).filter((h) => h.id !== id),
        revalidate: false,
        rollbackOnError: true,
      },
    )
    return true
  }

  return {
    habits: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch habits'
      : null,
    createHabit: handleCreateHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    refreshHabits: () => mutate(SWR_KEYS.habits),
  }
}
