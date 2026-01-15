import { getDatabase } from '../db'
import type { Event, CreateEventInput, UpdateEventInput } from '../types/event'

interface DbEvent {
  id: number
  title: string
  start_datetime: string
  end_datetime: string | null
  all_day: number
  recurrence_type: string
  recurrence_end_date: string | null
  recurrence_count: number | null
  recurrence_days_of_week: string | null
  category: string | null
  description: string | null
  created_at: string
  updated_at: string
}

function mapDbEventToEvent(dbEvent: DbEvent): Event {
  let recurrenceDaysOfWeek: number[] | null = null
  if (dbEvent.recurrence_days_of_week) {
    try {
      recurrenceDaysOfWeek = JSON.parse(dbEvent.recurrence_days_of_week)
    } catch {
      recurrenceDaysOfWeek = null
    }
  }

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    startDatetime: dbEvent.start_datetime,
    endDatetime: dbEvent.end_datetime,
    allDay: dbEvent.all_day === 1,
    recurrenceType: dbEvent.recurrence_type as Event['recurrenceType'],
    recurrenceEndDate: dbEvent.recurrence_end_date,
    recurrenceCount: dbEvent.recurrence_count,
    recurrenceDaysOfWeek,
    category: (dbEvent.category as Event['category']) || null,
    description: dbEvent.description,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
  }
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const db = await getDatabase()

  try {
    const recurrenceDaysOfWeekJson = input.recurrenceDaysOfWeek
      ? JSON.stringify(input.recurrenceDaysOfWeek)
      : null

    await db.execute(
      `INSERT INTO events (title, start_datetime, end_datetime, all_day, recurrence_type, recurrence_end_date, recurrence_count, recurrence_days_of_week, category, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.startDatetime,
        input.endDatetime || null,
        input.allDay ? 1 : 0,
        input.recurrenceType || 'none',
        input.recurrenceEndDate || null,
        input.recurrenceCount || null,
        recurrenceDaysOfWeekJson,
        input.category || null,
        input.description || null,
      ],
    )

    const result = await db.select<DbEvent[]>(
      `SELECT * FROM events 
       WHERE title = ? AND start_datetime = ?
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, input.startDatetime],
    )

    if (result.length === 0) {
      throw new Error('Failed to create event: record not found after insert')
    }

    return mapDbEventToEvent(result[0])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to create event: unknown error')
  }
}

export async function getAllEvents(): Promise<Event[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      'SELECT * FROM events ORDER BY start_datetime ASC, created_at ASC',
    )

    return result.map(mapDbEventToEvent)
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to get events: unknown error')
  }
}

export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Event[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      `SELECT * FROM events 
       WHERE start_datetime >= ? AND start_datetime <= ?
       ORDER BY start_datetime ASC, created_at ASC`,
      [startDate, endDate],
    )

    return result.map(mapDbEventToEvent)
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to get events by date range: unknown error')
  }
}
