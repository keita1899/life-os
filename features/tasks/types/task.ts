import type { RecurrenceRule } from '@/features/events'

export interface Task {
  id: number
  title: string
  executionDate: string | null
  completed: boolean
  order: number
  scheduledTime: string | null
  recurrenceRule: RecurrenceRule | null
  recurrenceDaysOfWeek: number[] | null
  recurrenceDayOfMonth: number | null
  recurrenceEndDate: string | null
  recurrenceExcludedDates: string[]
  memo?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  executionDate?: string | null
  scheduledTime?: string | null
  recurrenceRule?: RecurrenceRule | null
  recurrenceDaysOfWeek?: number[] | null
  recurrenceDayOfMonth?: number | null
  recurrenceEndDate?: string | null
  memo?: string | null
}

export interface UpdateTaskInput {
  title?: string
  executionDate?: string | null
  completed?: boolean
  order?: number
  scheduledTime?: string | null
  recurrenceRule?: RecurrenceRule | null
  recurrenceDaysOfWeek?: number[] | null
  recurrenceDayOfMonth?: number | null
  recurrenceEndDate?: string | null
  recurrenceExcludedDates?: string[]
  memo?: string | null
}
