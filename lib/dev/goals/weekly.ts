import { getDatabase, handleDbError } from '../../db'
import { DB_COLUMNS } from '../../db/constants'
import { getYearFromDate } from '../../goals/base'
import type {
  DevWeeklyGoal,
  CreateDevWeeklyGoalInput,
  UpdateDevWeeklyGoalInput,
} from '../../types/dev-weekly-goal'

interface DbDevWeeklyGoal {
  id: number
  title: string
  year: number
  week_start_date: string
  achieved: number
  created_at: string
  updated_at: string
}

function mapDbDevWeeklyGoalToDevWeeklyGoal(
  dbGoal: DbDevWeeklyGoal,
): DevWeeklyGoal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    year: dbGoal.year,
    weekStartDate: dbGoal.week_start_date,
    achieved: dbGoal.achieved === 1,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
  }
}

async function countDevWeeklyGoalsByWeekStart(
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

  try {
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM dev_weekly_goals 
       WHERE year = ? AND week_start_date = ? ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  } catch (err) {
    handleDbError(err, 'count dev weekly goals by week start')
  }
}

async function validateDevWeeklyLimit(
  year: number,
  weekStartDate: string,
  excludeId?: number,
): Promise<void> {
  const count = await countDevWeeklyGoalsByWeekStart(
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

export async function createDevWeeklyGoal(
  input: CreateDevWeeklyGoalInput,
): Promise<DevWeeklyGoal> {
  const db = await getDatabase()

  const weekStartDate = input.weekStartDate
  const year = getYearFromDate(weekStartDate)

  await validateDevWeeklyLimit(year, weekStartDate)

  try {
    await db.execute(
      `INSERT INTO dev_weekly_goals (title, year, week_start_date)
       VALUES (?, ?, ?)`,
      [input.title, year, weekStartDate],
    )

    const result = await db.select<DbDevWeeklyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_WEEKLY_GOALS.join(', ')} FROM dev_weekly_goals 
       WHERE title = ? AND year = ? AND week_start_date = ? 
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, year, weekStartDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create dev weekly goal: record not found after insert',
      )
    }

    return mapDbDevWeeklyGoalToDevWeeklyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'create dev weekly goal')
  }
}

export async function getDevWeeklyGoal(
  id: number,
): Promise<DevWeeklyGoal | null> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbDevWeeklyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_WEEKLY_GOALS.join(
        ', ',
      )} FROM dev_weekly_goals WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbDevWeeklyGoalToDevWeeklyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'get dev weekly goal')
  }
}

export async function getDevWeeklyGoalsByYear(
  year: number,
): Promise<DevWeeklyGoal[]> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbDevWeeklyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_WEEKLY_GOALS.join(
        ', ',
      )} FROM dev_weekly_goals WHERE year = ? ORDER BY week_start_date ASC, created_at DESC`,
      [year],
    )

    return result.map(mapDbDevWeeklyGoalToDevWeeklyGoal)
  } catch (err) {
    handleDbError(err, 'get dev weekly goals by year')
  }
}

export async function getDevWeeklyGoalByWeekStart(
  weekStartDate: string,
): Promise<DevWeeklyGoal | null> {
  const db = await getDatabase()
  const year = getYearFromDate(weekStartDate)
  try {
    const result = await db.select<DbDevWeeklyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_WEEKLY_GOALS.join(
        ', ',
      )} FROM dev_weekly_goals WHERE year = ? AND week_start_date = ? LIMIT 1`,
      [year, weekStartDate],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbDevWeeklyGoalToDevWeeklyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'get dev weekly goal by week start')
  }
}

export async function toggleDevWeeklyGoalAchievement(
  id: number,
): Promise<DevWeeklyGoal> {
  const db = await getDatabase()
  const currentGoal = await getDevWeeklyGoal(id)
  if (!currentGoal) {
    throw new Error('Dev weekly goal not found')
  }

  try {
    await db.execute(
      `UPDATE dev_weekly_goals SET achieved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [currentGoal.achieved ? 0 : 1, id],
    )

    const updatedGoal = await getDevWeeklyGoal(id)
    if (!updatedGoal) {
      throw new Error('Dev weekly goal not found')
    }

    return updatedGoal
  } catch (err) {
    handleDbError(err, 'toggle dev weekly goal achievement')
  }
}

export async function updateDevWeeklyGoal(
  id: number,
  input: UpdateDevWeeklyGoalInput,
): Promise<DevWeeklyGoal> {
  const db = await getDatabase()

  const currentGoal = await getDevWeeklyGoal(id)
  if (!currentGoal) {
    throw new Error('Dev weekly goal not found')
  }

  const newWeekStartDate = input.weekStartDate ?? currentGoal.weekStartDate
  const newYear = input.year ?? getYearFromDate(newWeekStartDate)

  if (
    newYear !== currentGoal.year ||
    newWeekStartDate !== currentGoal.weekStartDate
  ) {
    await validateDevWeeklyLimit(newYear, newWeekStartDate, id)
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

  try {
    await db.execute(
      `UPDATE dev_weekly_goals SET ${updates.join(', ')} WHERE id = ?`,
      values,
    )

    const updatedGoal = await getDevWeeklyGoal(id)
    if (!updatedGoal) {
      throw new Error('Dev weekly goal not found')
    }

    return updatedGoal
  } catch (err) {
    handleDbError(err, 'update dev weekly goal')
  }
}

export async function deleteDevWeeklyGoal(id: number): Promise<void> {
  const db = await getDatabase()
  try {
    await db.execute('DELETE FROM dev_weekly_goals WHERE id = ?', [id])
  } catch (err) {
    handleDbError(err, 'delete dev weekly goal')
  }
}
