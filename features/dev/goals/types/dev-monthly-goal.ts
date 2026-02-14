import type { ChecklistItem } from '@/lib/types/checklist-item'

export interface DevMonthlyGoal {
  id: number
  title: string
  year: number
  month: number
  achieved: boolean
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateDevMonthlyGoalInput {
  title: string
  year?: number
  month: number
  checklist?: ChecklistItem[]
}

export interface UpdateDevMonthlyGoalInput {
  title?: string
  year?: number
  month?: number
  checklist?: ChecklistItem[]
}
