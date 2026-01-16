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
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    startDatetime: dbEvent.start_datetime,
    endDatetime: dbEvent.end_datetime,
    allDay: dbEvent.all_day === 1,
    category: (dbEvent.category as Event['category']) || null,
    description: dbEvent.description,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
  }
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO events (title, start_datetime, end_datetime, all_day, recurrence_type, category, description)
       VALUES (?, ?, ?, ?, 'none', ?, ?)`,
      [
        input.title,
        input.startDatetime,
        input.endDatetime || null,
        input.allDay ? 1 : 0,
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

export async function getEventById(id: number): Promise<Event | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbEvent[]>(
      'SELECT * FROM events WHERE id = ?',
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbEventToEvent(result[0])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to get event by id: unknown error')
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

  if (updateFields.length === 0) {
    const result = await db.select<DbEvent[]>(
      'SELECT * FROM events WHERE id = ?',
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
      'SELECT * FROM events WHERE id = ?',
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update event: record not found after update')
    }

    return mapDbEventToEvent(result[0])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to update event: unknown error')
  }
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    await db.execute('DELETE FROM events WHERE id = ?', [id])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to delete event: unknown error')
  }
}
