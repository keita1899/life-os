import { getDatabase, handleDbError } from '@/lib/db'
import { DB_COLUMNS } from '@/lib/db/constants'
import type { ReviewMode, ReviewType } from '../types/review-completion'

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
  type: ReviewType,
  mode: ReviewMode,
): Promise<boolean> {
  try {
    const db = await getDatabase()
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
  type: ReviewType,
  mode: ReviewMode,
): Promise<void> {
  try {
    const db = await getDatabase()
    await db.execute(
      `INSERT OR IGNORE INTO review_completions (completed_date, type, mode) VALUES (?, ?, ?)`,
      [completedDate, type, mode],
    )
  } catch (err) {
    handleDbError(err, 'mark review complete')
  }
}
