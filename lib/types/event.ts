export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export type EventCategory =
  | 'work'
  | 'life'
  | 'housework'
  | 'social'
  | 'play'
  | 'hobby'
  | 'health'
  | 'procedure'
  | 'birthday'
  | 'anniversary'
  | null

export interface Event {
  id: number
  title: string
  startDatetime: string
  endDatetime: string | null
  allDay: boolean
  recurrenceType: RecurrenceType
  recurrenceEndDate: string | null
  recurrenceCount: number | null
  recurrenceDaysOfWeek: number[] | null
  category: EventCategory
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  title: string
  startDatetime: string
  endDatetime?: string | null
  allDay?: boolean
  recurrenceType?: RecurrenceType
  recurrenceEndDate?: string | null
  recurrenceCount?: number | null
  recurrenceDaysOfWeek?: number[] | null
  category?: EventCategory
  description?: string | null
}

export interface UpdateEventInput {
  title?: string
  startDatetime?: string
  endDatetime?: string | null
  allDay?: boolean
  recurrenceType?: RecurrenceType
  recurrenceEndDate?: string | null
  recurrenceCount?: number | null
  recurrenceDaysOfWeek?: number[] | null
  category?: EventCategory
  description?: string | null
}
