import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import { getYearFromDate, getWeekStartDateFromDate } from './base'
import type {
  WeeklyGoal,
  CreateWeeklyGoalInput,
  UpdateWeeklyGoalInput,
} from '../types/weekly-goal'

interface DbWeeklyGoal {
  id: number
  title: string
  year: number
  week_start_date: string
  created_at: string
  updated_at: string
}

function mapDbWeeklyGoalToWeeklyGoal(dbGoal: DbWeeklyGoal): WeeklyGoal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    year: dbGoal.year,
    weekStartDate: dbGoal.week_start_date,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
  }
}

async function countWeeklyGoalsByWeekStart(
  year: number,
  weekStartDate: string,
  excludeId?: number,
): Promise<number> {
  const db = await getDatabase()

  const excludeClause = excludeId ? 'AND id != ?' : ''
  const params: unknown[] = [year, weekStartDate]

  if (excludeId) {
    params.push(excludeId)
  }

  const result = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM weekly_goals 
     WHERE year = ? AND week_start_date = ? ${excludeClause}`,
    params,
  )
  return result[0]?.count || 0
}

async function validateWeeklyLimit(
  year: number,
  weekStartDate: string,
  excludeId?: number,
): Promise<void> {
  const count = await countWeeklyGoalsByWeekStart(
    year,
    weekStartDate,
    excludeId,
  )
  if (count >= 1) {
    throw new Error(
      `${weekStartDate}から始まる週の週間目標は1つまで設定できます`,
    )
  }
}

export async function createWeeklyGoal(
  input: CreateWeeklyGoalInput,
): Promise<WeeklyGoal> {
  const db = await getDatabase()

  const weekStartDate = input.weekStartDate
  const year = getYearFromDate(weekStartDate)

  await validateWeeklyLimit(year, weekStartDate)

  try {
    await db.execute(
      `INSERT INTO weekly_goals (title, year, week_start_date)
       VALUES (?, ?, ?)`,
      [input.title, year, weekStartDate],
    )

    const result = await db.select<DbWeeklyGoal[]>(
      `SELECT ${DB_COLUMNS.WEEKLY_GOALS.join(', ')} FROM weekly_goals 
       WHERE title = ? AND year = ? AND week_start_date = ? 
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, year, weekStartDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create weekly goal: record not found after insert',
      )
    }

    return mapDbWeeklyGoalToWeeklyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'create weekly goal')
  }
}

export async function getWeeklyGoal(id: number): Promise<WeeklyGoal | null> {
  const db = await getDatabase()
  const result = await db.select<DbWeeklyGoal[]>(
    `SELECT ${DB_COLUMNS.WEEKLY_GOALS.join(
      ', ',
    )} FROM weekly_goals WHERE id = ?`,
    [id],
  )

  if (result.length === 0) {
    return null
  }

  return mapDbWeeklyGoalToWeeklyGoal(result[0])
}

export async function getWeeklyGoalsByYear(
  year: number,
): Promise<WeeklyGoal[]> {
  const db = await getDatabase()
  const result = await db.select<DbWeeklyGoal[]>(
    `SELECT ${DB_COLUMNS.WEEKLY_GOALS.join(
      ', ',
    )} FROM weekly_goals WHERE year = ? ORDER BY week_start_date ASC, created_at DESC`,
    [year],
  )

  return result.map(mapDbWeeklyGoalToWeeklyGoal)
}

export async function getWeeklyGoalByWeekStart(
  weekStartDate: string,
): Promise<WeeklyGoal | null> {
  const db = await getDatabase()
  const year = getYearFromDate(weekStartDate)
  const result = await db.select<DbWeeklyGoal[]>(
    `SELECT ${DB_COLUMNS.WEEKLY_GOALS.join(
      ', ',
    )} FROM weekly_goals WHERE year = ? AND week_start_date = ? LIMIT 1`,
    [year, weekStartDate],
  )

  if (result.length === 0) {
    return null
  }

  return mapDbWeeklyGoalToWeeklyGoal(result[0])
}

export async function updateWeeklyGoal(
  id: number,
  input: UpdateWeeklyGoalInput,
): Promise<WeeklyGoal> {
  const db = await getDatabase()

  const currentGoal = await getWeeklyGoal(id)
  if (!currentGoal) {
    throw new Error('Weekly goal not found')
  }

  const newWeekStartDate = input.weekStartDate ?? currentGoal.weekStartDate
  const newYear = input.year ?? getYearFromDate(newWeekStartDate)

  if (
    newYear !== currentGoal.year ||
    newWeekStartDate !== currentGoal.weekStartDate
  ) {
    await validateWeeklyLimit(newYear, newWeekStartDate, id)
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (input.title !== undefined) {
    updates.push('title = ?')
    values.push(input.title)
  }
  if (input.year !== undefined) {
    updates.push('year = ?')
    values.push(input.year)
  } else if (newYear !== currentGoal.year) {
    updates.push('year = ?')
    values.push(newYear)
  }
  if (input.weekStartDate !== undefined) {
    updates.push('week_start_date = ?')
    values.push(input.weekStartDate)
  }

  if (updates.length === 0) {
    return currentGoal
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await db.execute(
    `UPDATE weekly_goals SET ${updates.join(', ')} WHERE id = ?`,
    values,
  )

  const updatedGoal = await getWeeklyGoal(id)
  if (!updatedGoal) {
    throw new Error('Weekly goal not found')
  }

  return updatedGoal
}

export async function deleteWeeklyGoal(id: number): Promise<void> {
  const db = await getDatabase()
  try {
    await db.execute('DELETE FROM weekly_goals WHERE id = ?', [id])
  } catch (err) {
    handleDbError(err, 'delete weekly goal')
  }
}
