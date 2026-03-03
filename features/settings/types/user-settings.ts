export type CalendarViewMode = 'month' | 'week'

export interface WeekdayThemes {
  [dayIndex: string]: string // "0"=日, "1"=月, ..., "6"=土
}

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
  lifeWeekdayThemes: WeekdayThemes
  devWeekdayThemes: WeekdayThemes
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
  lifeWeekdayThemes?: WeekdayThemes
  devWeekdayThemes?: WeekdayThemes
}
