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
    await createHabit(input)
    await mutate(habitsKey)
  }

  const handleUpdateHabit = async (id: number, input: UpdateHabitInput) => {
    await updateHabit(id, input)
    await mutate(habitsKey)
  }

  const handleDeleteHabit = async (id: number) => {
    await deleteHabit(id)
    await mutate(habitsKey)
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
