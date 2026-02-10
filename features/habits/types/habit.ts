export type HabitFrequencyType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'monthly_last'
  | 'custom_days'

export interface Habit {
  id: number
  name: string
  scheduledTime: string | null
  frequencyType: HabitFrequencyType
  frequencyDays: string | null
  frequencyDayOfMonth: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateHabitInput {
  name: string
  scheduledTime?: string | null
  frequencyType: HabitFrequencyType
  frequencyDays?: string | null
  frequencyDayOfMonth?: number | null
}

export interface UpdateHabitInput {
  name?: string
  scheduledTime?: string | null
  frequencyType?: HabitFrequencyType
  frequencyDays?: string | null
  frequencyDayOfMonth?: number | null
  order?: number
}
