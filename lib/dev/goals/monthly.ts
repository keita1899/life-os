import { getDatabase, handleDbError } from '../../db'
import { DB_COLUMNS } from '../../db/constants'
import { getYearFromDate, getMonthFromDate } from '../../goals/base'
import type {
  DevMonthlyGoal,
  CreateDevMonthlyGoalInput,
  UpdateDevMonthlyGoalInput,
} from '../../types/dev-monthly-goal'

interface DbDevMonthlyGoal {
  id: number
  title: string
  target_date: string | null
  year: number
  month: number
  achieved: number
  created_at: string
  updated_at: string
}

function mapDbDevMonthlyGoalToDevMonthlyGoal(
  dbGoal: DbDevMonthlyGoal,
): DevMonthlyGoal {
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

async function countDevMonthlyGoalsByYearMonth(
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

  try {
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM dev_monthly_goals 
       WHERE year = ? AND month = ? ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  } catch (err) {
    handleDbError(err, 'count dev monthly goals by year month')
  }
}

async function validateDevMonthlyLimit(
  year: number,
  month: number,
  excludeId?: number,
): Promise<void> {
  const count = await countDevMonthlyGoalsByYearMonth(year, month, excludeId)
  if (count >= 1) {
    throw new Error(`${year}年${month}月の月間目標は1つまで設定できます`)
  }
}

export async function createDevMonthlyGoal(
  input: CreateDevMonthlyGoalInput,
): Promise<DevMonthlyGoal> {
  const db = await getDatabase()

  const year = input.year ?? getYearFromDate(input.targetDate)
  const month = input.month ?? getMonthFromDate(input.targetDate)

  await validateDevMonthlyLimit(year, month)

  try {
    await db.execute(
      `INSERT INTO dev_monthly_goals (title, target_date, year, month)
       VALUES (?, ?, ?, ?)`,
      [input.title, input.targetDate || null, year, month],
    )

    const result = await db.select<DbDevMonthlyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_MONTHLY_GOALS.join(', ')} FROM dev_monthly_goals 
       WHERE title = ? AND year = ? AND month = ? 
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, year, month],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create dev monthly goal: record not found after insert',
      )
    }

    return mapDbDevMonthlyGoalToDevMonthlyGoal(result[0])
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      throw new Error(`${year}年${month}月の月間目標は1つまで設定できます`)
    }
    handleDbError(err, 'create dev monthly goal')
  }
}

export async function getDevMonthlyGoal(
  id: number,
): Promise<DevMonthlyGoal | null> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbDevMonthlyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_MONTHLY_GOALS.join(
        ', ',
      )} FROM dev_monthly_goals WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbDevMonthlyGoalToDevMonthlyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'get dev monthly goal')
  }
}

export async function getDevMonthlyGoalsByYear(
  year: number,
): Promise<DevMonthlyGoal[]> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbDevMonthlyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_MONTHLY_GOALS.join(
        ', ',
      )} FROM dev_monthly_goals WHERE year = ? ORDER BY month ASC, created_at DESC`,
      [year],
    )

    return result.map(mapDbDevMonthlyGoalToDevMonthlyGoal)
  } catch (err) {
    handleDbError(err, 'get dev monthly goals by year')
  }
}

export async function toggleDevMonthlyGoalAchievement(
  id: number,
): Promise<DevMonthlyGoal> {
  const db = await getDatabase()
  const currentGoal = await getDevMonthlyGoal(id)
  if (!currentGoal) {
    throw new Error('Dev monthly goal not found')
  }

  try {
    await db.execute(
      `UPDATE dev_monthly_goals SET achieved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [currentGoal.achieved ? 0 : 1, id],
    )

    const updatedGoal = await getDevMonthlyGoal(id)
    if (!updatedGoal) {
      throw new Error('Dev monthly goal not found')
    }

    return updatedGoal
  } catch (err) {
    handleDbError(err, 'toggle dev monthly goal achievement')
  }
}

export async function updateDevMonthlyGoal(
  id: number,
  input: UpdateDevMonthlyGoalInput,
): Promise<DevMonthlyGoal> {
  const db = await getDatabase()

  const currentGoal = await getDevMonthlyGoal(id)
  if (!currentGoal) {
    throw new Error('Dev monthly goal not found')
  }

  const newYear =
    input.year ?? getYearFromDate(input.targetDate) ?? currentGoal.year
  const newMonth =
    input.month ?? getMonthFromDate(input.targetDate) ?? currentGoal.month
  const newTargetDate =
    input.targetDate !== undefined ? input.targetDate : currentGoal.targetDate

  if (newYear !== currentGoal.year || newMonth !== currentGoal.month) {
    await validateDevMonthlyLimit(newYear, newMonth, id)
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

  try {
    await db.execute(
      `UPDATE dev_monthly_goals SET ${updates.join(', ')} WHERE id = ?`,
      values,
    )

    const updatedGoal = await getDevMonthlyGoal(id)
    if (!updatedGoal) {
      throw new Error('Dev monthly goal not found')
    }

    return updatedGoal
  } catch (err) {
    handleDbError(err, 'update dev monthly goal')
  }
}

export async function deleteDevMonthlyGoal(id: number): Promise<void> {
  const db = await getDatabase()
  try {
    await db.execute('DELETE FROM dev_monthly_goals WHERE id = ?', [id])
  } catch (err) {
    handleDbError(err, 'delete dev monthly goal')
  }
}
