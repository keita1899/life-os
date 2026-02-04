import type { RecurrenceRule } from './event'

export interface Task {
  id: number
  title: string
  executionDate: string | null
  completed: boolean
  order: number
  actualTime: number
  recurrenceRule: RecurrenceRule | null
  recurrenceDaysOfWeek: number[] | null
  recurrenceDayOfMonth: number | null
  recurrenceEndDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  executionDate?: string | null
  recurrenceRule?: RecurrenceRule | null
  recurrenceDaysOfWeek?: number[] | null
  recurrenceDayOfMonth?: number | null
  recurrenceEndDate?: string | null
}

export interface UpdateTaskInput {
  title?: string
  executionDate?: string | null
  completed?: boolean
  order?: number
  actualTime?: number
  recurrenceRule?: RecurrenceRule | null
  recurrenceDaysOfWeek?: number[] | null
  recurrenceDayOfMonth?: number | null
  recurrenceEndDate?: string | null
}
