import { getDatabase, handleDbError } from '@/lib/db'
import { DB_COLUMNS } from '@/lib/db/constants'
import type { ReviewMode } from '../types/review-completion'

interface DbReviewCompletion {
  id: number
  completed_date: string
  type: string
  mode: string
  completed_at: string
}

const COLS = DB_COLUMNS.REVIEW_COMPLETIONS.join(', ')

export async function getReviewCompletion(
  completedDate: string,
  type: string,
  mode: ReviewMode,
): Promise<boolean> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbReviewCompletion[]>(
      `SELECT ${COLS} FROM review_completions WHERE completed_date = ? AND type = ? AND mode = ? LIMIT 1`,
      [completedDate, type, mode],
    )
    return result.length > 0
  } catch (err) {
    handleDbError(err, 'get review completion')
  }
}

export async function markReviewComplete(
  completedDate: string,
  type: string,
  mode: ReviewMode,
): Promise<void> {
  const db = await getDatabase()
  try {
    await db.execute(
      `INSERT INTO review_completions (completed_date, type, mode) VALUES (?, ?, ?)`,
      [completedDate, type, mode],
    )
  } catch (err) {
    handleDbError(err, 'mark review complete')
  }
}
