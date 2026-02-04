import type { ChecklistItem } from './checklist-item'

export interface DevYearlyGoal {
  id: number
  title: string
  year: number
  achieved: boolean
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateDevYearlyGoalInput {
  title: string
  year?: number
  checklist?: ChecklistItem[]
}

export interface UpdateDevYearlyGoalInput {
  title?: string
  year?: number
  checklist?: ChecklistItem[]
}
