import { startOfMonth, endOfMonth } from 'date-fns'
import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import { formatDateISO } from '../date/formats'
import type { HabitCompletion } from '../types/habit-completion'

interface DbHabitCompletion {
  id: number
  habit_id: number
  completed_date: string
  created_at: string
}

function mapDbToHabitCompletion(db: DbHabitCompletion): HabitCompletion {
  return {
    id: db.id,
    habitId: db.habit_id,
    completedDate: db.completed_date,
    createdAt: db.created_at,
  }
}

const columns = DB_COLUMNS.HABIT_COMPLETIONS.join(', ')

export async function getCompletionsByHabitAndMonth(
  habitId: number,
  year: number,
  month: number,
): Promise<HabitCompletion[]> {
  const db = await getDatabase()
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(start)
  const startStr = formatDateISO(start)
  const endStr = formatDateISO(end)

  try {
    const result = await db.select<DbHabitCompletion[]>(
      `SELECT ${columns} FROM habit_completions
       WHERE habit_id = ? AND completed_date >= ? AND completed_date <= ?
       ORDER BY completed_date ASC`,
      [habitId, startStr, endStr],
    )
    return result.map(mapDbToHabitCompletion)
  } catch (err) {
    handleDbError(err, 'get habit completions by habit and month')
  }
}

export async function getCompletionsByDate(
  date: string,
): Promise<HabitCompletion[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbHabitCompletion[]>(
      `SELECT ${columns} FROM habit_completions WHERE completed_date = ?
       ORDER BY habit_id ASC`,
      [date],
    )
    return result.map(mapDbToHabitCompletion)
  } catch (err) {
    handleDbError(err, 'get habit completions by date')
  }
}

export async function createCompletion(
  habitId: number,
  completedDate: string,
): Promise<HabitCompletion> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT OR IGNORE INTO habit_completions (habit_id, completed_date)
       VALUES (?, ?)`,
      [habitId, completedDate],
    )

    const result = await db.select<DbHabitCompletion[]>(
      `SELECT ${columns} FROM habit_completions
       WHERE habit_id = ? AND completed_date = ? LIMIT 1`,
      [habitId, completedDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create habit completion: record not found after insert',
      )
    }

    return mapDbToHabitCompletion(result[0])
  } catch (err) {
    handleDbError(err, 'create habit completion')
  }
}

export async function deleteCompletion(
  habitId: number,
  completedDate: string,
): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
      [habitId, completedDate],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Habit completion not found')
    }
  } catch (err) {
    handleDbError(err, 'delete habit completion')
  }
}
