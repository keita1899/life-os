import { getDatabase } from '../db'
import { getYearFromDate } from './base'
import type {
  YearlyGoal,
  CreateYearlyGoalInput,
  UpdateYearlyGoalInput,
} from '../types/yearly-goal'

interface DbYearlyGoal {
  id: number
  title: string
  target_date: string | null
  year: number
  created_at: string
  updated_at: string
}

function mapDbYearlyGoalToYearlyGoal(dbGoal: DbYearlyGoal): YearlyGoal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    targetDate: dbGoal.target_date,
    year: dbGoal.year,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
  }
}

async function countYearlyGoalsByYear(
  year: number,
  excludeId?: number,
): Promise<number> {
  const db = await getDatabase()

  const excludeClause = excludeId ? 'AND id != ?' : ''
  const params: unknown[] = [year]

  if (excludeId) {
    params.push(excludeId)
  }

  const result = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM yearly_goals 
     WHERE year = ? ${excludeClause}`,
    params,
  )
  return result[0]?.count || 0
}

async function validateYearlyLimit(
  year: number,
  excludeId?: number,
): Promise<void> {
  const count = await countYearlyGoalsByYear(year, excludeId)
  if (count >= 3) {
    throw new Error(`${year}年の年間目標は3つまで設定できます`)
  }
}

export async function createYearlyGoal(
  input: CreateYearlyGoalInput,
): Promise<YearlyGoal> {
  const db = await getDatabase()

  const year = input.year ?? getYearFromDate(input.targetDate)

  await validateYearlyLimit(year)

  try {
    await db.execute(
      `INSERT INTO yearly_goals (title, target_date, year)
       VALUES (?, ?, ?)`,
      [input.title, input.targetDate || null, year],
    )

    const result = await db.select<DbYearlyGoal[]>(
      `SELECT * FROM yearly_goals 
       WHERE title = ? AND year = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [input.title, year],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create yearly goal: record not found after insert',
      )
    }

    return mapDbYearlyGoalToYearlyGoal(result[0])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to create yearly goal: unknown error')
  }
}

export async function getYearlyGoal(id: number): Promise<YearlyGoal | null> {
  const db = await getDatabase()
  const result = await db.select<DbYearlyGoal[]>(
    'SELECT * FROM yearly_goals WHERE id = ?',
    [id],
  )

  if (result.length === 0) {
    return null
  }

  return mapDbYearlyGoalToYearlyGoal(result[0])
}

export async function getYearlyGoalsByYear(
  year: number,
): Promise<YearlyGoal[]> {
  const db = await getDatabase()
  const result = await db.select<DbYearlyGoal[]>(
    'SELECT * FROM yearly_goals WHERE year = ? ORDER BY created_at DESC',
    [year],
  )

  return result.map(mapDbYearlyGoalToYearlyGoal)
}

export async function updateYearlyGoal(
  id: number,
  input: UpdateYearlyGoalInput,
): Promise<YearlyGoal> {
  const db = await getDatabase()

  const currentGoal = await getYearlyGoal(id)
  if (!currentGoal) {
    throw new Error('Yearly goal not found')
  }

  const newYear =
    input.year ?? getYearFromDate(input.targetDate) ?? currentGoal.year
  const newTargetDate =
    input.targetDate !== undefined ? input.targetDate : currentGoal.targetDate

  if (newYear !== currentGoal.year) {
    await validateYearlyLimit(newYear, id)
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
  }

  if (updates.length === 0) {
    return currentGoal
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await db.execute(
    `UPDATE yearly_goals SET ${updates.join(', ')} WHERE id = ?`,
    values,
  )

  const updatedGoal = await getYearlyGoal(id)
  if (!updatedGoal) {
    throw new Error('Yearly goal not found')
  }

  return updatedGoal
}

export async function deleteYearlyGoal(id: number): Promise<void> {
  const db = await getDatabase()
  await db.execute('DELETE FROM yearly_goals WHERE id = ?', [id])
}
