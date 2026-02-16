import {
  createMonthlyGoalsApi,
  DEV_GOALS_CONFIG,
} from '@/features/goals/lib/core'
import type {
  DevMonthlyGoal,
  CreateDevMonthlyGoalInput,
  UpdateDevMonthlyGoalInput,
} from '../types/dev-monthly-goal'

const api = createMonthlyGoalsApi(DEV_GOALS_CONFIG)

export async function createDevMonthlyGoal(
  input: CreateDevMonthlyGoalInput,
): Promise<DevMonthlyGoal> {
  return api.create(input) as Promise<DevMonthlyGoal>
}

export async function getDevMonthlyGoal(
  id: number,
): Promise<DevMonthlyGoal | null> {
  return api.getById(id) as Promise<DevMonthlyGoal | null>
}

export async function getDevMonthlyGoalsByYear(
  year: number,
): Promise<DevMonthlyGoal[]> {
  return api.getByYear(year) as Promise<DevMonthlyGoal[]>
}

export async function toggleDevMonthlyGoalAchievement(
  id: number,
): Promise<DevMonthlyGoal> {
  return api.toggleAchievement(id) as Promise<DevMonthlyGoal>
}

export async function updateDevMonthlyGoal(
  id: number,
  input: UpdateDevMonthlyGoalInput,
): Promise<DevMonthlyGoal> {
  return api.update(id, input) as Promise<DevMonthlyGoal>
}

export async function deleteDevMonthlyGoal(id: number): Promise<void> {
  return api.delete(id)
}
