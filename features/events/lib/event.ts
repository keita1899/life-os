import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  Event,
  CreateEventInput,
  UpdateEventInput,
  RecurrenceRule,
} from '../types/event'

/** order は SQLite 予約語のためクォートが必要 */
const EVENT_COLUMNS = DB_COLUMNS.EVENTS.map((col) =>
  col === 'order' ? '"order"' : col,
).join(', ')

const EVENT_UPDATE_MAPPING: FieldMapping<UpdateEventInput> = [
  { key: 'title', column: 'title' },
  { key: 'startDatetime', column: 'start_datetime' },
  { key: 'endDatetime', column: 'end_datetime', transform: (v) => v || null },
  { key: 'allDay', column: 'all_day', transform: (v) => (v ? 1 : 0) },
  { key: 'category', column: 'category', transform: (v) => v || null },
  { key: 'description', column: 'description', transform: (v) => v || null },
  { key: 'recurrenceRule', column: 'recurrence_rule', transform: (v) => v || null },
  {
    key: 'recurrenceDaysOfWeek',
    column: 'recurrence_days_of_week',
    transform: (v) =>
      Array.isArray(v) && v.length > 0 ? v.join(',') : null,
  },
  {
    key: 'recurrenceDayOfMonth',
    column: 'recurrence_day_of_month',
    transform: (v) => v ?? null,
  },
  { key: 'recurrenceEndDate', column: 'recurrence_end_date', transform: (v) => v || null },
  {
    key: 'recurrenceExcludedDates',
    column: 'recurrence_excluded_dates',
    transform: (v) =>
      Array.isArray(v) && v.length > 0 ? JSON.stringify(v) : null,
  },
]

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
  recurrence_excluded_dates: string | null
  order: number
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
  let excludedDates: string[] = []
  if (dbEvent.recurrence_excluded_dates) {
    try {
      excludedDates = JSON.parse(dbEvent.recurrence_excluded_dates)
    } catch {
      excludedDates = []
    }
  }

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
    recurrenceExcludedDates: excludedDates,
    order: dbEvent.order,
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

    const maxOrderResult = await db.select<{ max_order: number | null }[]>(
      'SELECT MAX("order") as max_order FROM events',
    )
    const nextOrder = (maxOrderResult[0]?.max_order ?? -1) + 1

    await db.execute(
      `INSERT INTO events (title, start_datetime, end_datetime, all_day, category, description, recurrence_rule, recurrence_day_of_week, recurrence_days_of_week, recurrence_day_of_month, recurrence_end_date, recurrence_excluded_dates, "order")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        null,
        nextOrder,
      ],
    )

    const result = await db.select<DbEvent[]>(
      `SELECT ${EVENT_COLUMNS} FROM events 
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
      `SELECT ${EVENT_COLUMNS} FROM events ORDER BY "order" ASC, start_datetime ASC`,
    )

    return result.map(mapDbEventToEvent)
  } catch (err) {
    handleDbError(err, 'get events')
  }
}

export async function reorderEvents(
  updates: { id: number; order: number }[],
): Promise<void> {
  if (updates.length === 0) return
  const db = await getDatabase()

  try {
    for (const { id, order } of updates) {
      await db.execute('UPDATE events SET "order" = ? WHERE id = ?', [
        order,
        id,
      ])
    }
  } catch (err) {
    handleDbError(err, 'reorder events')
  }
}

export async function updateEvent(
  id: number,
  input: UpdateEventInput,
): Promise<Event> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, EVENT_UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbEvent[]>(
        `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Event not found')
      }
      return mapDbEventToEvent(result[0])
    } catch (err) {
      handleDbError(err, 'update event')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE events SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbEvent[]>(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`,
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
