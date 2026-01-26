import { getDatabase, handleDbError } from '../../db'
import { DB_COLUMNS } from '../../db/constants'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
  UpdateDevYearlyGoalInput,
} from '../../types/dev-yearly-goal'

interface DbDevYearlyGoal {
  id: number
  title: string
  year: number
  achieved: number
  created_at: string
  updated_at: string
}

function mapDbDevYearlyGoalToDevYearlyGoal(
  dbGoal: DbDevYearlyGoal,
): DevYearlyGoal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    year: dbGoal.year,
    achieved: dbGoal.achieved === 1,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
  }
}

async function countDevYearlyGoalsByYear(
  year: number,
  excludeId?: number,
): Promise<number> {
  const db = await getDatabase()

  const excludeClause = excludeId ? 'AND id != ?' : ''
  const params: unknown[] = [year]

  if (excludeId) {
    params.push(excludeId)
  }

  try {
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM dev_yearly_goals 
       WHERE year = ? ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  } catch (err) {
    handleDbError(err, 'count dev yearly goals by year')
  }
}

async function validateDevYearlyLimit(
  year: number,
  excludeId?: number,
): Promise<void> {
  const count = await countDevYearlyGoalsByYear(year, excludeId)
  if (count >= 1) {
    throw new Error(`${year}年の年間目標は1つまで設定できます`)
  }
}

export async function createDevYearlyGoal(
  input: CreateDevYearlyGoalInput,
): Promise<DevYearlyGoal> {
  const db = await getDatabase()

  const year = input.year ?? new Date().getFullYear()

  await validateDevYearlyLimit(year)

  try {
    await db.execute(
      `INSERT INTO dev_yearly_goals (title, year)
       VALUES (?, ?)`,
      [input.title, year],
    )

    const result = await db.select<DbDevYearlyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_YEARLY_GOALS.join(', ')} FROM dev_yearly_goals 
       WHERE title = ? AND year = ? 
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, year],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create dev yearly goal: record not found after insert',
      )
    }

    return mapDbDevYearlyGoalToDevYearlyGoal(result[0])
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      throw new Error(`${year}年の年間目標は1つまで設定できます`)
    }
    handleDbError(err, 'create dev yearly goal')
  }
}

export async function getDevYearlyGoal(
  id: number,
): Promise<DevYearlyGoal | null> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbDevYearlyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_YEARLY_GOALS.join(', ')} FROM dev_yearly_goals WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbDevYearlyGoalToDevYearlyGoal(result[0])
  } catch (err) {
    handleDbError(err, 'get dev yearly goal')
  }
}

export async function getDevYearlyGoalsByYear(
  year: number,
): Promise<DevYearlyGoal[]> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbDevYearlyGoal[]>(
      `SELECT ${DB_COLUMNS.DEV_YEARLY_GOALS.join(', ')} FROM dev_yearly_goals WHERE year = ? ORDER BY created_at DESC`,
      [year],
    )

    return result.map(mapDbDevYearlyGoalToDevYearlyGoal)
  } catch (err) {
    handleDbError(err, 'get dev yearly goals by year')
  }
}

export async function toggleDevYearlyGoalAchievement(
  id: number,
): Promise<DevYearlyGoal> {
  const db = await getDatabase()
  const currentGoal = await getDevYearlyGoal(id)
  if (!currentGoal) {
    throw new Error('Dev yearly goal not found')
  }

  try {
    await db.execute(
      `UPDATE dev_yearly_goals SET achieved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [currentGoal.achieved ? 0 : 1, id],
    )

    const updatedGoal = await getDevYearlyGoal(id)
    if (!updatedGoal) {
      throw new Error('Dev yearly goal not found')
    }

    return updatedGoal
  } catch (err) {
    handleDbError(err, 'toggle dev yearly goal achievement')
  }
}

export async function updateDevYearlyGoal(
  id: number,
  input: UpdateDevYearlyGoalInput,
): Promise<DevYearlyGoal> {
  const db = await getDatabase()

  const currentGoal = await getDevYearlyGoal(id)
  if (!currentGoal) {
    throw new Error('Dev yearly goal not found')
  }

  const newYear = input.year ?? currentGoal.year

  if (newYear !== currentGoal.year) {
    await validateDevYearlyLimit(newYear, id)
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
  }

  if (updates.length === 0) {
    return currentGoal
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  try {
    await db.execute(
      `UPDATE dev_yearly_goals SET ${updates.join(', ')} WHERE id = ?`,
      values,
    )

    const updatedGoal = await getDevYearlyGoal(id)
    if (!updatedGoal) {
      throw new Error('Dev yearly goal not found')
    }

    return updatedGoal
  } catch (err) {
    handleDbError(err, 'update dev yearly goal')
  }
}

export async function deleteDevYearlyGoal(id: number): Promise<void> {
  const db = await getDatabase()
  try {
    await db.execute('DELETE FROM dev_yearly_goals WHERE id = ?', [id])
  } catch (err) {
    handleDbError(err, 'delete dev yearly goal')
  }
}
