import type { ChecklistItem } from '@/lib/types/checklist-item'

export interface YearlyGoal {
  id: number
  title: string
  year: number
  achieved: boolean
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateYearlyGoalInput {
  title: string
  year?: number
  checklist?: ChecklistItem[]
}

export interface UpdateYearlyGoalInput {
  title?: string
  year?: number
  checklist?: ChecklistItem[]
}
