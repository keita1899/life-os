import { createYearlyGoalsApi, LIFE_GOALS_CONFIG } from './core'
import type {
  YearlyGoal,
  CreateYearlyGoalInput,
  UpdateYearlyGoalInput,
} from '../types/yearly-goal'

const api = createYearlyGoalsApi(LIFE_GOALS_CONFIG)

export async function createYearlyGoal(
  input: CreateYearlyGoalInput,
): Promise<YearlyGoal> {
  return api.create(input)
}

export async function getYearlyGoal(id: number): Promise<YearlyGoal | null> {
  return api.getById(id)
}

export async function getYearlyGoalsByYear(year: number): Promise<YearlyGoal[]> {
  return api.getByYear(year)
}

export async function toggleYearlyGoalAchievement(
  id: number,
): Promise<YearlyGoal> {
  return api.toggleAchievement(id)
}

export async function updateYearlyGoal(
  id: number,
  input: UpdateYearlyGoalInput,
): Promise<YearlyGoal> {
  return api.update(id, input)
}

export async function deleteYearlyGoal(id: number): Promise<void> {
  return api.delete(id)
}
