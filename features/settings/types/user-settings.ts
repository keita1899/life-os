export type CalendarViewMode = 'month' | 'week'

export interface UserSettings {
  id: number
  birthday: string | null
  defaultCalendarView: CalendarViewMode
  weekStartDay: number
  morningReviewTime: string | null
  eveningReviewTime: string | null
  weekStartReviewTime: string | null
  weekEndReviewTime: string | null
  barcelonaIcalUrl: string | null
  initialBalance: number | null
  defaultHabitView: CalendarViewMode
  notifyEvents: boolean
  notifyTasks: boolean
  notifyHabits: boolean
  notifyMinutesBefore: number
  createdAt: string
  updatedAt: string
}

export interface UpdateUserSettingsInput {
  birthday?: string | null
  defaultCalendarView?: CalendarViewMode
  weekStartDay?: number
  morningReviewTime?: string | null
  eveningReviewTime?: string | null
  weekStartReviewTime?: string | null
  weekEndReviewTime?: string | null
  barcelonaIcalUrl?: string | null
  initialBalance?: number | null
  defaultHabitView?: CalendarViewMode
  notifyEvents?: boolean
  notifyTasks?: boolean
  notifyHabits?: boolean
  notifyMinutesBefore?: number
}
