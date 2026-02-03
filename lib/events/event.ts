import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  Event,
  CreateEventInput,
  UpdateEventInput,
  RecurrenceRule,
} from '../types/event'

interface DbEvent {
  id: number
  title: string
  start_datetime: string
  end_datetime: string | null
  all_day: number
  category: string | null
  description: string | null
  recurrence_rule: string | null
  recurrence_day_of_week: number | null
  recurrence_days_of_week: string | null
  recurrence_day_of_month: number | null
  recurrence_end_date: string | null
  created_at: string
  updated_at: string
}

function parseDaysOfWeek(
  daysStr: string | null,
  fallbackSingle: number | null,
): number[] | null {
  if (daysStr?.trim()) {
    const parsed = daysStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
    if (parsed.length > 0) return parsed
  }
  if (fallbackSingle !== null && fallbackSingle !== undefined) {
    return [fallbackSingle]
  }
  return null
}

function mapDbEventToEvent(dbEvent: DbEvent): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    startDatetime: dbEvent.start_datetime,
    endDatetime: dbEvent.end_datetime,
    allDay: dbEvent.all_day === 1,
    category: (dbEvent.category as Event['category']) || null,
    description: dbEvent.description,
    recurrenceRule: (dbEvent.recurrence_rule as RecurrenceRule) || null,
    recurrenceDaysOfWeek: parseDaysOfWeek(
      dbEvent.recurrence_days_of_week ?? null,
      dbEvent.recurrence_day_of_week ?? null,
    ),
    recurrenceDayOfMonth: dbEvent.recurrence_day_of_month ?? null,
    recurrenceEndDate: dbEvent.recurrence_end_date || null,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
  }
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const db = await getDatabase()

  try {
    const recurrenceDaysOfWeekStr =
      (input.recurrenceDaysOfWeek?.length ?? 0) > 0
        ? input.recurrenceDaysOfWeek!.join(',')
        : null

    await db.execute(
      `INSERT INTO events (title, start_datetime, end_datetime, all_day, category, description, recurrence_rule, recurrence_day_of_week, recurrence_days_of_week, recurrence_day_of_month, recurrence_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.startDatetime,
        input.endDatetime || null,
        input.allDay ? 1 : 0,
        input.category || null,
        input.description || null,
        input.recurrenceRule || null,
        null,
        recurrenceDaysOfWeekStr,
        input.recurrenceDayOfMonth ?? null,
        input.recurrenceEndDate || null,
      ],
    )

    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(', ')} FROM events 
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
    handleDbError(err, 'create event')
  }
}

export async function getAllEvents(): Promise<Event[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(
        ', ',
      )} FROM events ORDER BY start_datetime ASC, created_at ASC`,
    )

    return result.map(mapDbEventToEvent)
  } catch (err) {
    handleDbError(err, 'get events')
  }
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(', ')} FROM events WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbEventToEvent(result[0])
  } catch (err) {
    handleDbError(err, 'get event by id')
  }
}

export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Event[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(', ')} FROM events 
       WHERE start_datetime >= ? AND start_datetime <= ?
       ORDER BY start_datetime ASC, created_at ASC`,
      [startDate, endDate],
    )

    return result.map(mapDbEventToEvent)
  } catch (err) {
    handleDbError(err, 'get events by date range')
  }
}

export async function updateEvent(
  id: number,
  input: UpdateEventInput,
): Promise<Event> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.title !== undefined) {
    updateFields.push('title = ?')
    updateValues.push(input.title)
  }

  if (input.startDatetime !== undefined) {
    updateFields.push('start_datetime = ?')
    updateValues.push(input.startDatetime)
  }

  if (input.endDatetime !== undefined) {
    updateFields.push('end_datetime = ?')
    updateValues.push(input.endDatetime || null)
  }

  if (input.allDay !== undefined) {
    updateFields.push('all_day = ?')
    updateValues.push(input.allDay ? 1 : 0)
  }

  if (input.category !== undefined) {
    updateFields.push('category = ?')
    updateValues.push(input.category || null)
  }

  if (input.description !== undefined) {
    updateFields.push('description = ?')
    updateValues.push(input.description || null)
  }

  if (input.recurrenceRule !== undefined) {
    updateFields.push('recurrence_rule = ?')
    updateValues.push(input.recurrenceRule || null)
  }

  if (input.recurrenceDaysOfWeek !== undefined) {
    updateFields.push('recurrence_days_of_week = ?')
    updateValues.push(
      input.recurrenceDaysOfWeek?.length
        ? input.recurrenceDaysOfWeek.join(',')
        : null,
    )
  }

  if (input.recurrenceDayOfMonth !== undefined) {
    updateFields.push('recurrence_day_of_month = ?')
    updateValues.push(input.recurrenceDayOfMonth ?? null)
  }

  if (input.recurrenceEndDate !== undefined) {
    updateFields.push('recurrence_end_date = ?')
    updateValues.push(input.recurrenceEndDate || null)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(', ')} FROM events WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Event not found')
    }
    return mapDbEventToEvent(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(', ')} FROM events WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update event: record not found after update')
    }

    return mapDbEventToEvent(result[0])
  } catch (err) {
    handleDbError(err, 'update event')
  }
}

export async function getEventsByCategory(
  category: string,
): Promise<Event[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      `SELECT ${DB_COLUMNS.EVENTS.join(
        ', ',
      )} FROM events WHERE category = ? ORDER BY start_datetime ASC, created_at ASC`,
      [category],
    )

    return result.map(mapDbEventToEvent)
  } catch (err) {
    handleDbError(err, 'get events by category')
  }
}

export async function deleteEventsByCategory(category: string): Promise<void> {
  const db = await getDatabase()

  try {
    await db.execute('DELETE FROM events WHERE category = ?', [category])
  } catch (err) {
    handleDbError(err, 'delete events by category')
  }
}

export async function deleteBarcelonaMatches(): Promise<void> {
  const db = await getDatabase()

  try {
    await db.execute("DELETE FROM events WHERE category = 'barca'")
  } catch (err) {
    handleDbError(err, 'delete Barcelona matches')
  }
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    await db.execute('DELETE FROM events WHERE id = ?', [id])
  } catch (err) {
    handleDbError(err, 'delete event')
  }
}
