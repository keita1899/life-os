import {
  createWeeklyGoalsApi,
  DEV_GOALS_CONFIG,
} from '@/features/goals/lib/core'
import type {
  DevWeeklyGoal,
  CreateDevWeeklyGoalInput,
  UpdateDevWeeklyGoalInput,
} from '../types/dev-weekly-goal'

const api = createWeeklyGoalsApi(DEV_GOALS_CONFIG)

export async function createDevWeeklyGoal(
  input: CreateDevWeeklyGoalInput,
): Promise<DevWeeklyGoal> {
  return api.create(input) as Promise<DevWeeklyGoal>
}

export async function getDevWeeklyGoal(
  id: number,
): Promise<DevWeeklyGoal | null> {
  return api.getById(id) as Promise<DevWeeklyGoal | null>
}

export async function getDevWeeklyGoalsByYear(
  year: number,
): Promise<DevWeeklyGoal[]> {
  return api.getByYear(year) as Promise<DevWeeklyGoal[]>
}

export async function getDevWeeklyGoalByWeekStart(
  weekStartDate: string,
): Promise<DevWeeklyGoal | null> {
  return api.getByWeekStart(weekStartDate) as Promise<DevWeeklyGoal | null>
}

export async function toggleDevWeeklyGoalAchievement(
  id: number,
): Promise<DevWeeklyGoal> {
  return api.toggleAchievement(id) as Promise<DevWeeklyGoal>
}

export async function updateDevWeeklyGoal(
  id: number,
  input: UpdateDevWeeklyGoalInput,
): Promise<DevWeeklyGoal> {
  return api.update(id, input) as Promise<DevWeeklyGoal>
}

export async function deleteDevWeeklyGoal(id: number): Promise<void> {
  return api.delete(id)
}
