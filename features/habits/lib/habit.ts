import { getDatabase, handleDbError } from '@/lib/db'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
} from '../types/habit'

interface DbHabit {
  id: number
  name: string
  scheduled_time: string | null
  frequency_type: string
  frequency_days: string | null
  frequency_day_of_month: number | null
  order: number
  created_at: string
  updated_at: string
}

function habitColumns(): string {
  return DB_COLUMNS.HABITS.map((col) =>
    col === 'order' ? '"order"' : col,
  ).join(', ')
}

function mapDbHabitToHabit(dbHabit: DbHabit): Habit {
  return {
    id: dbHabit.id,
    name: dbHabit.name,
    scheduledTime: dbHabit.scheduled_time,
    frequencyType: dbHabit.frequency_type as Habit['frequencyType'],
    frequencyDays: dbHabit.frequency_days,
    frequencyDayOfMonth: dbHabit.frequency_day_of_month,
    order: dbHabit.order,
    createdAt: dbHabit.created_at,
    updatedAt: dbHabit.updated_at,
  }
}

async function getMaxOrder(): Promise<number> {
  const db = await getDatabase()
  const result = await db.select<{ max_order: number | null }[]>(
    'SELECT MAX("order") as max_order FROM habits',
  )
  return result[0]?.max_order ?? -1
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbHabit[]>(
      `SELECT ${habitColumns()} FROM habits ORDER BY "order" ASC, created_at ASC`,
    )
    return result.map(mapDbHabitToHabit)
  } catch (err) {
    handleDbError(err, 'get habits')
  }
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const db = await getDatabase()
  const maxOrder = await getMaxOrder()
  const newOrder = maxOrder + 1

  try {
    await db.execute(
      `INSERT INTO habits (name, scheduled_time, frequency_type, frequency_days, frequency_day_of_month, "order")
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.scheduledTime ?? null,
        input.frequencyType,
        input.frequencyDays ?? null,
        input.frequencyDayOfMonth ?? null,
        newOrder,
      ],
    )

    const result = await db.select<DbHabit[]>(
      `SELECT ${habitColumns()} FROM habits WHERE name = ? AND "order" = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [input.name, newOrder],
    )

    if (result.length === 0) {
      throw new Error('Failed to create habit: record not found after insert')
    }

    return mapDbHabitToHabit(result[0])
  } catch (err) {
    handleDbError(err, 'create habit')
  }
}

export async function updateHabit(
  id: number,
  input: UpdateHabitInput,
): Promise<Habit> {
  const db = await getDatabase()
  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }
  if (input.scheduledTime !== undefined) {
    updateFields.push('scheduled_time = ?')
    updateValues.push(input.scheduledTime ?? null)
  }
  if (input.frequencyType !== undefined) {
    updateFields.push('frequency_type = ?')
    updateValues.push(input.frequencyType)
  }
  if (input.frequencyDays !== undefined) {
    updateFields.push('frequency_days = ?')
    updateValues.push(input.frequencyDays ?? null)
  }
  if (input.frequencyDayOfMonth !== undefined) {
    updateFields.push('frequency_day_of_month = ?')
    updateValues.push(input.frequencyDayOfMonth ?? null)
  }
  if (input.order !== undefined) {
    updateFields.push('"order" = ?')
    updateValues.push(input.order)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbHabit[]>(
      `SELECT ${habitColumns()} FROM habits WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Habit not found')
    }
    return mapDbHabitToHabit(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE habits SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbHabit[]>(
      `SELECT ${habitColumns()} FROM habits WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update habit: record not found after update')
    }

    return mapDbHabitToHabit(result[0])
  } catch (err) {
    handleDbError(err, 'update habit')
  }
}

export async function deleteHabit(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM habits WHERE id = ?', [id])

    if (result.rowsAffected === 0) {
      throw new Error('Habit not found')
    }
  } catch (err) {
    handleDbError(err, 'delete habit')
  }
}
