import { getDatabase } from './db'
import type { Goal, CreateGoalInput, UpdateGoalInput } from './types/goal'

export async function createGoalTable(): Promise<void> {
  const db = await getDatabase()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target_date DATE,
      period_type TEXT NOT NULL DEFAULT 'yearly',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function getYearFromGoal(goal: Goal, targetDate?: string | null): number {
  if (targetDate !== undefined) {
    return targetDate
      ? new Date(targetDate).getFullYear()
      : new Date().getFullYear()
  }
  if (goal.targetDate) {
    return new Date(goal.targetDate).getFullYear()
  }
  return new Date(goal.createdAt).getFullYear()
}

function getMonthFromGoal(goal: Goal, targetDate?: string | null): number {
  if (targetDate !== undefined) {
    return targetDate
      ? new Date(targetDate).getMonth() + 1
      : new Date().getMonth() + 1
  }
  if (goal.targetDate) {
    return new Date(goal.targetDate).getMonth() + 1
  }
  return new Date(goal.createdAt).getMonth() + 1
}

async function countGoalsByPeriod(
  periodType: 'yearly' | 'monthly',
  year: number,
  month?: number,
  excludeId?: number,
): Promise<number> {
  const db = await getDatabase()
  await createGoalTable()

  const excludeClause = excludeId ? 'AND id != ?' : ''
  const params: unknown[] = []

  if (periodType === 'yearly') {
    params.push(year.toString(), year.toString())
    if (excludeId) {
      params.push(excludeId)
    }
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM goals 
       WHERE period_type = 'yearly' 
       AND (
         (target_date IS NOT NULL AND strftime('%Y', target_date) = ?)
         OR (target_date IS NULL AND strftime('%Y', created_at) = ?)
       )
       ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  } else {
    if (!month) return 0
    params.push(
      year.toString(),
      month.toString().padStart(2, '0'),
      year.toString(),
      month.toString().padStart(2, '0'),
    )
    if (excludeId) {
      params.push(excludeId)
    }
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM goals 
       WHERE period_type = 'monthly' 
       AND (
         (target_date IS NOT NULL AND strftime('%Y', target_date) = ? AND strftime('%m', target_date) = ?)
         OR (target_date IS NULL AND strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?)
       )
       ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  }
}

async function validateGoalLimit(
  periodType: 'yearly' | 'monthly',
  year: number,
  month: number | undefined,
  excludeId?: number,
): Promise<void> {
  if (periodType === 'yearly') {
    const count = await countGoalsByPeriod('yearly', year, undefined, excludeId)
    if (count >= 3) {
      throw new Error(`${year}年の年間目標は3つまで設定できます`)
    }
  } else {
    if (!month) return
    const count = await countGoalsByPeriod('monthly', year, month, excludeId)
    if (count >= 1) {
      throw new Error('月間目標は月ごとに１つだけ設定できます')
    }
  }
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const db = await getDatabase()
  await createGoalTable()

  const periodType = input.periodType || 'yearly'

  const year = input.targetDate
    ? new Date(input.targetDate).getFullYear()
    : new Date().getFullYear()

  if (periodType === 'yearly') {
    const count = await countGoalsByPeriod('yearly', year)
    if (count >= 3) {
      throw new Error(`${year}年の年間目標は3つまで設定できます`)
    }
  } else if (periodType === 'monthly') {
    const month = input.targetDate
      ? new Date(input.targetDate).getMonth() + 1
      : new Date().getMonth() + 1
    const count = await countGoalsByPeriod('monthly', year, month)
    if (count >= 1) {
      throw new Error('月間目標は月ごとに１つだけ設定できます')
    }
  }

  await db.execute(
    `INSERT INTO goals (title, target_date, period_type)
     VALUES (?, ?, ?)`,
    [input.title, input.targetDate || null, periodType],
  )

  const result = await db.select<DbGoal[]>(
    'SELECT * FROM goals WHERE id = last_insert_rowid()',
  )

  if (result.length === 0) {
    throw new Error('Failed to create goal')
  }

  return mapDbGoalToGoal(result[0])
}

export async function getGoal(id: number): Promise<Goal | null> {
  const db = await getDatabase()
  const result = await db.select<DbGoal[]>('SELECT * FROM goals WHERE id = ?', [
    id,
  ])

  if (result.length === 0) {
    return null
  }

  return mapDbGoalToGoal(result[0])
}

export async function getAllGoals(): Promise<Goal[]> {
  const db = await getDatabase()
  await createGoalTable()
  const result = await db.select<DbGoal[]>(
    'SELECT * FROM goals ORDER BY created_at DESC',
  )

  return result.map(mapDbGoalToGoal)
}

export async function updateGoal(
  id: number,
  input: UpdateGoalInput,
): Promise<Goal> {
  const db = await getDatabase()
  await createGoalTable()

  const currentGoal = await getGoal(id)
  if (!currentGoal) {
    throw new Error('Goal not found')
  }

  const newPeriodType = input.periodType ?? currentGoal.periodType
  const newTargetDate =
    input.targetDate !== undefined ? input.targetDate : currentGoal.targetDate
  const periodTypeChanged =
    input.periodType !== undefined &&
    input.periodType !== currentGoal.periodType
  const targetDateChanged =
    input.targetDate !== undefined &&
    input.targetDate !== currentGoal.targetDate

  if (periodTypeChanged || targetDateChanged) {
    const newYear = getYearFromGoal(currentGoal, newTargetDate)
    const newMonth =
      newPeriodType === 'monthly'
        ? getMonthFromGoal(currentGoal, newTargetDate)
        : undefined

    if (periodTypeChanged) {
      await validateGoalLimit(newPeriodType, newYear, newMonth)
    } else {
      const oldYear = getYearFromGoal(currentGoal)
      const oldMonth =
        currentGoal.periodType === 'monthly'
          ? getMonthFromGoal(currentGoal)
          : undefined
      const yearChanged = newYear !== oldYear
      const monthChanged =
        newMonth !== undefined &&
        oldMonth !== undefined &&
        newMonth !== oldMonth

      if (yearChanged || monthChanged) {
        await validateGoalLimit(newPeriodType, newYear, newMonth, id)
      }
    }
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
  if (input.periodType !== undefined) {
    updates.push('period_type = ?')
    values.push(input.periodType)
  }

  if (updates.length === 0) {
    return currentGoal
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await db.execute(
    `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`,
    values,
  )

  const updatedGoal = await getGoal(id)
  if (!updatedGoal) {
    throw new Error('Goal not found')
  }

  return updatedGoal
}

export async function deleteGoal(id: number): Promise<void> {
  const db = await getDatabase()
  await db.execute('DELETE FROM goals WHERE id = ?', [id])
}

interface DbGoal {
  id: number
  title: string
  target_date: string | null
  period_type: string
  created_at: string
  updated_at: string
}

function mapDbGoalToGoal(dbGoal: DbGoal): Goal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    targetDate: dbGoal.target_date,
    periodType: dbGoal.period_type as Goal['periodType'],
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
  }
}
