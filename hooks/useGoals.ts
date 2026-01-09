import useSWR from 'swr'
import { mutate } from 'swr'
import { createGoal, getAllGoals } from '@/lib/goals'
import type { Goal, CreateGoalInput } from '@/lib/types/goal'
import { fetcher } from '@/lib/swr'

const GOALS_KEY = 'goals'

export function useGoals() {
  const {
    data: goals = [],
    error,
    isLoading,
  } = useSWR<Goal[]>(GOALS_KEY, () => fetcher(() => getAllGoals()))

  const handleCreateGoal = async (input: CreateGoalInput) => {
    try {
      await createGoal(input)
      await mutate(GOALS_KEY)
    } catch (err) {
      throw err
    }
  }

  return {
    goals,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch goals'
      : null,
    createGoal: handleCreateGoal,
    refreshGoals: () => mutate(GOALS_KEY),
  }
}
