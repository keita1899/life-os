import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/habits'
import type { Habit, CreateHabitInput, UpdateHabitInput } from '@/lib/types/habit'
import { fetcher } from '@/lib/swr'

const habitsKey = 'habits'

export function useHabits() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Habit[]>(habitsKey, () => fetcher(() => getAllHabits()))

  const handleCreateHabit = async (input: CreateHabitInput) => {
    const result = await createHabit(input)
    await mutate(habitsKey)
    return result
  }

  const handleUpdateHabit = async (id: number, input: UpdateHabitInput) => {
    const result = await updateHabit(id, input)
    await mutate(habitsKey)
    return result
  }

  const handleDeleteHabit = async (id: number) => {
    await deleteHabit(id)
    await mutate(habitsKey)
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
    refreshHabits: () => mutate(habitsKey),
  }
}
