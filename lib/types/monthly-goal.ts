import type { ChecklistItem } from './checklist-item'

export interface MonthlyGoal {
  id: number
  title: string
  year: number
  month: number
  achieved: boolean
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateMonthlyGoalInput {
  title: string
  year?: number
  month: number
  checklist?: ChecklistItem[]
}

export interface UpdateMonthlyGoalInput {
  title?: string
  year?: number
  month?: number
  checklist?: ChecklistItem[]
}
