import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  DailyLog,
  CreateDailyLogInput,
  UpdateDailyLogInput,
} from '../types/daily-log'

interface DbDailyLog {
  id: number
  log_date: string
  diary: string | null
  created_at: string
  updated_at: string
}

function mapDbDailyLogToDailyLog(dbDailyLog: DbDailyLog): DailyLog {
  return {
    id: dbDailyLog.id,
    logDate: dbDailyLog.log_date,
    diary: dbDailyLog.diary,
    createdAt: dbDailyLog.created_at,
    updatedAt: dbDailyLog.updated_at,
  }
}

export async function getDailyLogByDate(logDate: string): Promise<DailyLog | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbDailyLog[]>(
      `SELECT ${DB_COLUMNS.DAILY_LOGS.join(', ')} FROM daily_logs
       WHERE log_date = ?
       LIMIT 1`,
      [logDate],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbDailyLogToDailyLog(result[0])
  } catch (err) {
    handleDbError(err, 'get daily log by date')
  }
}

export async function createDailyLog(
  input: CreateDailyLogInput,
): Promise<DailyLog> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO daily_logs (log_date, diary)
       VALUES (?, ?)`,
      [input.logDate, input.diary || null],
    )

    const result = await db.select<DbDailyLog[]>(
      `SELECT ${DB_COLUMNS.DAILY_LOGS.join(', ')} FROM daily_logs
       WHERE log_date = ?
       LIMIT 1`,
      [input.logDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create daily log: record not found after insert',
      )
    }

    return mapDbDailyLogToDailyLog(result[0])
  } catch (err) {
    handleDbError(err, 'create daily log')
  }
}

export async function updateDailyLog(
  logDate: string,
  input: UpdateDailyLogInput,
): Promise<DailyLog> {
  const db = await getDatabase()

  try {
    await db.execute(
      `UPDATE daily_logs SET diary = ?, updated_at = CURRENT_TIMESTAMP
       WHERE log_date = ?`,
      [input.diary || null, logDate],
    )

    const result = await db.select<DbDailyLog[]>(
      `SELECT ${DB_COLUMNS.DAILY_LOGS.join(', ')} FROM daily_logs
       WHERE log_date = ?`,
      [logDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to update daily log: record not found after update',
      )
    }

    return mapDbDailyLogToDailyLog(result[0])
  } catch (err) {
    handleDbError(err, 'update daily log')
  }
}

export async function deleteDailyLog(logDate: string): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM daily_logs WHERE log_date = ?',
      [logDate],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Daily log not found')
    }
  } catch (err) {
    handleDbError(err, 'delete daily log')
  }
}
