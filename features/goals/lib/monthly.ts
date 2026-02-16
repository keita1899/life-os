import { createMonthlyGoalsApi, LIFE_GOALS_CONFIG } from './core'
import type {
  MonthlyGoal,
  CreateMonthlyGoalInput,
  UpdateMonthlyGoalInput,
} from '../types/monthly-goal'

const api = createMonthlyGoalsApi(LIFE_GOALS_CONFIG)

export async function createMonthlyGoal(
  input: CreateMonthlyGoalInput,
): Promise<MonthlyGoal> {
  return api.create(input) as Promise<MonthlyGoal>
}

export async function getMonthlyGoal(id: number): Promise<MonthlyGoal | null> {
  return api.getById(id) as Promise<MonthlyGoal | null>
}

export async function getMonthlyGoalsByYear(
  year: number,
): Promise<MonthlyGoal[]> {
  return api.getByYear(year) as Promise<MonthlyGoal[]>
}

export async function toggleMonthlyGoalAchievement(
  id: number,
): Promise<MonthlyGoal> {
  return api.toggleAchievement(id) as Promise<MonthlyGoal>
}

export async function updateMonthlyGoal(
  id: number,
  input: UpdateMonthlyGoalInput,
): Promise<MonthlyGoal> {
  return api.update(id, input) as Promise<MonthlyGoal>
}

export async function deleteMonthlyGoal(id: number): Promise<void> {
  return api.delete(id)
}
