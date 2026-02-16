import {
  createYearlyGoalsApi,
  DEV_GOALS_CONFIG,
} from '@/features/goals/lib/core'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
  UpdateDevYearlyGoalInput,
} from '../types/dev-yearly-goal'

const api = createYearlyGoalsApi(DEV_GOALS_CONFIG)

export async function createDevYearlyGoal(
  input: CreateDevYearlyGoalInput,
): Promise<DevYearlyGoal> {
  return api.create(input) as Promise<DevYearlyGoal>
}

export async function getDevYearlyGoal(
  id: number,
): Promise<DevYearlyGoal | null> {
  return api.getById(id) as Promise<DevYearlyGoal | null>
}

export async function getDevYearlyGoalsByYear(
  year: number,
): Promise<DevYearlyGoal[]> {
  return api.getByYear(year) as Promise<DevYearlyGoal[]>
}

export async function toggleDevYearlyGoalAchievement(
  id: number,
): Promise<DevYearlyGoal> {
  return api.toggleAchievement(id) as Promise<DevYearlyGoal>
}

export async function updateDevYearlyGoal(
  id: number,
  input: UpdateDevYearlyGoalInput,
): Promise<DevYearlyGoal> {
  return api.update(id, input) as Promise<DevYearlyGoal>
}

export async function deleteDevYearlyGoal(id: number): Promise<void> {
  return api.delete(id)
}
