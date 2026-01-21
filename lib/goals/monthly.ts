import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import { getYearFromDate, getMonthFromDate } from './base'
import type {
  MonthlyGoal,
  CreateMonthlyGoalInput,
  UpdateMonthlyGoalInput,
} from '../types/monthly-goal'

interface DbMonthlyGoal {
  id: number
  title: string
  target_date: string | null
  year: number
  month: number
  achieved: number
  created_at: string
  updated_at: string
}

function mapDbMonthlyGoalToMonthlyGoal(dbGoal: DbMonthlyGoal): MonthlyGoal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    targetDate: dbGoal.target_date,
    year: dbGoal.year,
    month: dbGoal.month,
    achieved: dbGoal.achieved === 1,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
  }
}

async function countMonthlyGoalsByYearMonth(
  year: number,
  month: number,
  excludeId?: number,
): Promise<number> {
  const db = await getDatabase()

  const excludeClause = excludeId ? 'AND id != ?' : ''
  const params: unknown[] = [year, month]

  if (excludeId) {
    params.push(excludeId)
  }

  const result = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM monthly_goals 
     WHERE year = ? AND month = ? ${excludeClause}`,
    params,
  )
  return result[0]?.count || 0
}

async function validateMonthlyLimit(
  year: number,
  month: number,
  excludeId?: number,
): Promise<void> {
  const count = await countMonthlyGoalsByYearMonth(year, month, excludeId)
  if (count >= 1) {
    throw new Error(`${year}年${month}月の月間目標は1つまで設定できます`)
  }
}

export async function createMonthlyGoal(
  input: CreateMonthlyGoalInput,
): Promise<MonthlyGoal> {
  const db = await getDatabase()

  const year = input.year ?? getYearFromDate(input.targetDate)
  const month = input.month ?? getMonthFromDate(input.targetDate)

  await validateMonthlyLimit(year, month)

  try {
    await db.execute(
      `INSERT INTO monthly_goals (title, target_date, year, month)
       VALUES (?, ?, ?, ?)`,
      [input.title, input.targetDate || null, year, month],
    )

    const result = await db.select<DbMonthlyGoal[]>(
      `SELECT ${DB_COLUMNS.MONTHLY_GOALS.join(', ')} FROM monthly_goals 
       WHERE title = ? AND year = ? AND month = ? 
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, year, month],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create monthly goal: record not found after insert',
      )
    }

    return mapDbMonthlyGoalToMonthlyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'create monthly goal')
  }
}

export async function getMonthlyGoal(id: number): Promise<MonthlyGoal | null> {
  const db = await getDatabase()
  const result = await db.select<DbMonthlyGoal[]>(
    `SELECT ${DB_COLUMNS.MONTHLY_GOALS.join(
      ', ',
    )} FROM monthly_goals WHERE id = ?`,
    [id],
  )

  if (result.length === 0) {
    return null
  }

  return mapDbMonthlyGoalToMonthlyGoal(result[0])
}

export async function getMonthlyGoalsByYear(
  year: number,
): Promise<MonthlyGoal[]> {
  const db = await getDatabase()
  const result = await db.select<DbMonthlyGoal[]>(
    `SELECT ${DB_COLUMNS.MONTHLY_GOALS.join(
      ', ',
    )} FROM monthly_goals WHERE year = ? ORDER BY month ASC, created_at DESC`,
    [year],
  )

  return result.map(mapDbMonthlyGoalToMonthlyGoal)
}

export async function toggleMonthlyGoalAchievement(
  id: number,
): Promise<MonthlyGoal> {
  const db = await getDatabase()
  const currentGoal = await getMonthlyGoal(id)
  if (!currentGoal) {
    throw new Error('Monthly goal not found')
  }

  await db.execute(
    `UPDATE monthly_goals SET achieved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [currentGoal.achieved ? 0 : 1, id],
  )

  const updatedGoal = await getMonthlyGoal(id)
  if (!updatedGoal) {
    throw new Error('Monthly goal not found')
  }

  return updatedGoal
}

export async function updateMonthlyGoal(
  id: number,
  input: UpdateMonthlyGoalInput,
): Promise<MonthlyGoal> {
  const db = await getDatabase()

  const currentGoal = await getMonthlyGoal(id)
  if (!currentGoal) {
    throw new Error('Monthly goal not found')
  }

  const newYear =
    input.year ?? getYearFromDate(input.targetDate) ?? currentGoal.year
  const newMonth =
    input.month ?? getMonthFromDate(input.targetDate) ?? currentGoal.month
  const newTargetDate =
    input.targetDate !== undefined ? input.targetDate : currentGoal.targetDate

  if (newYear !== currentGoal.year || newMonth !== currentGoal.month) {
    await validateMonthlyLimit(newYear, newMonth, id)
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (input.title !== undefined) {
    updates.push('title = ?')
    values.push(input.title)
  }
  if (input.targetDate !== undefined) {
    updates.push('target_date = ?')
    values.push(input.targetDate)
  }
  if (input.year !== undefined) {
    updates.push('year = ?')
    values.push(input.year)
  } else if (newYear !== currentGoal.year) {
    updates.push('year = ?')
    values.push(newYear)
  }
  if (input.month !== undefined) {
    updates.push('month = ?')
    values.push(input.month)
  } else if (newMonth !== currentGoal.month) {
    updates.push('month = ?')
    values.push(newMonth)
  }

  if (updates.length === 0) {
    return currentGoal
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await db.execute(
    `UPDATE monthly_goals SET ${updates.join(', ')} WHERE id = ?`,
    values,
  )

  const updatedGoal = await getMonthlyGoal(id)
  if (!updatedGoal) {
    throw new Error('Monthly goal not found')
  }

  return updatedGoal
}

export async function deleteMonthlyGoal(id: number): Promise<void> {
  const db = await getDatabase()
  try {
    await db.execute('DELETE FROM monthly_goals WHERE id = ?', [id])
  } catch (err) {
    handleDbError(err, 'delete monthly goal')
  }
}
