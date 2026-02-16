import {
  createWeeklyGoalsApi,
  LIFE_GOALS_CONFIG,
} from './core'
import type {
  WeeklyGoal,
  CreateWeeklyGoalInput,
  UpdateWeeklyGoalInput,
} from '../types/weekly-goal'

const api = createWeeklyGoalsApi(LIFE_GOALS_CONFIG)

export async function createWeeklyGoal(
  input: CreateWeeklyGoalInput,
): Promise<WeeklyGoal> {
  return api.create(input) as Promise<WeeklyGoal>
}

export async function getWeeklyGoal(id: number): Promise<WeeklyGoal | null> {
  return api.getById(id) as Promise<WeeklyGoal | null>
}

export async function getWeeklyGoalsByYear(year: number): Promise<WeeklyGoal[]> {
  return api.getByYear(year) as Promise<WeeklyGoal[]>
}

export async function getWeeklyGoalByWeekStart(
  weekStartDate: string,
): Promise<WeeklyGoal | null> {
  return api.getByWeekStart(weekStartDate) as Promise<WeeklyGoal | null>
}

export async function toggleWeeklyGoalAchievement(
  id: number,
): Promise<WeeklyGoal> {
  return api.toggleAchievement(id) as Promise<WeeklyGoal>
}

export async function updateWeeklyGoal(
  id: number,
  input: UpdateWeeklyGoalInput,
): Promise<WeeklyGoal> {
  return api.update(id, input) as Promise<WeeklyGoal>
}

export async function deleteWeeklyGoal(id: number): Promise<void> {
  return api.delete(id)
}
