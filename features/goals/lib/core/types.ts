import type { ChecklistItem } from '@/features/goals'

export interface YearlyGoalShape {
  id: number
  title: string
  year: number
  achieved: boolean
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateYearlyGoalInputShape {
  title: string
  year?: number
  checklist?: ChecklistItem[]
}

export interface UpdateYearlyGoalInputShape {
  title?: string
  year?: number
  checklist?: ChecklistItem[]
}

export interface MonthlyGoalShape {
  id: number
  title: string
  year: number
  month: number
  achieved: boolean
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateMonthlyGoalInputShape {
  title: string
  year?: number
  month?: number
  checklist?: ChecklistItem[]
}

export interface UpdateMonthlyGoalInputShape {
  title?: string
  year?: number
  month?: number
  checklist?: ChecklistItem[]
}

export interface WeeklyGoalShape {
  id: number
  title: string
  year: number
  weekStartDate: string
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWeeklyGoalInputShape {
  title: string
  weekStartDate: string
  year?: number
}

export interface UpdateWeeklyGoalInputShape {
  title?: string
  year?: number
  weekStartDate?: string
}
