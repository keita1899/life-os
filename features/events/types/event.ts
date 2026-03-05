export type EventCategory =
  | 'work'
  | 'life'
  | 'housework'
  | 'social'
  | 'play'
  | 'hobby'
  | 'health'
  | 'travel'
  | 'sports'
  | 'barca'
  | 'procedure'
  | 'birthday'
  | 'anniversary'
  | null

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly'

export interface Event {
  id: number
  title: string
  startDatetime: string
  endDatetime: string | null
  allDay: boolean
  category: EventCategory
  description: string | null
  recurrenceRule: RecurrenceRule | null
  recurrenceDaysOfWeek: number[] | null
  recurrenceDayOfMonth: number | null
  recurrenceEndDate: string | null
  recurrenceExcludedDates: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  title: string
  startDatetime: string
  endDatetime?: string | null
  allDay?: boolean
  category?: EventCategory
  description?: string | null
  recurrenceRule?: RecurrenceRule | null
  recurrenceDaysOfWeek?: number[] | null
  recurrenceDayOfMonth?: number | null
  recurrenceEndDate?: string | null
}

export interface UpdateEventInput {
  title?: string
  startDatetime?: string
  endDatetime?: string | null
  allDay?: boolean
  category?: EventCategory
  description?: string | null
  recurrenceRule?: RecurrenceRule | null
  recurrenceDaysOfWeek?: number[] | null
  recurrenceDayOfMonth?: number | null
  recurrenceEndDate?: string | null
  recurrenceExcludedDates?: string[]
}
