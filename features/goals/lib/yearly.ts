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
  return api.create(input) as Promise<YearlyGoal>
}

export async function getYearlyGoal(id: number): Promise<YearlyGoal | null> {
  return api.getById(id) as Promise<YearlyGoal | null>
}

export async function getYearlyGoalsByYear(year: number): Promise<YearlyGoal[]> {
  return api.getByYear(year) as Promise<YearlyGoal[]>
}

export async function toggleYearlyGoalAchievement(
  id: number,
): Promise<YearlyGoal> {
  return api.toggleAchievement(id) as Promise<YearlyGoal>
}

export async function updateYearlyGoal(
  id: number,
  input: UpdateYearlyGoalInput,
): Promise<YearlyGoal> {
  return api.update(id, input) as Promise<YearlyGoal>
}

export async function deleteYearlyGoal(id: number): Promise<void> {
  return api.delete(id)
}
