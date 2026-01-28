import { getDatabase, handleDbError } from '../../db'
import { DB_COLUMNS } from '../../db/constants'
import type {
  DevDailyLog,
  CreateDevDailyLogInput,
  UpdateDevDailyLogInput,
} from '../../types/dev-daily-log'

interface DbDevDailyLog {
  id: number
  log_date: string
  report: string | null
  created_at: string
  updated_at: string
}

function mapDbDevDailyLogToDevDailyLog(
  dbDevDailyLog: DbDevDailyLog,
): DevDailyLog {
  return {
    id: dbDevDailyLog.id,
    logDate: dbDevDailyLog.log_date,
    report: dbDevDailyLog.report,
    createdAt: dbDevDailyLog.created_at,
    updatedAt: dbDevDailyLog.updated_at,
  }
}

export async function getDevDailyLogByDate(
  logDate: string,
): Promise<DevDailyLog | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbDevDailyLog[]>(
      `SELECT ${DB_COLUMNS.DEV_DAILY_LOGS.join(', ')} FROM dev_daily_logs
       WHERE log_date = ?
       LIMIT 1`,
      [logDate],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbDevDailyLogToDevDailyLog(result[0])
  } catch (err) {
    handleDbError(err, 'get dev daily log by date')
  }
}

export async function createDevDailyLog(
  input: CreateDevDailyLogInput,
): Promise<DevDailyLog> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO dev_daily_logs (log_date, report)
       VALUES (?, ?)`,
      [input.logDate, input.report ?? null],
    )

    const result = await db.select<DbDevDailyLog[]>(
      `SELECT ${DB_COLUMNS.DEV_DAILY_LOGS.join(', ')} FROM dev_daily_logs
       WHERE log_date = ?
       LIMIT 1`,
      [input.logDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create dev daily log: record not found after insert',
      )
    }

    return mapDbDevDailyLogToDevDailyLog(result[0])
  } catch (err) {
    handleDbError(err, 'create dev daily log')
  }
}

export async function updateDevDailyLog(
  logDate: string,
  input: UpdateDevDailyLogInput,
): Promise<DevDailyLog> {
  const db = await getDatabase()

  try {
    await db.execute(
      `UPDATE dev_daily_logs SET report = ?, updated_at = CURRENT_TIMESTAMP
       WHERE log_date = ?`,
      [input.report ?? null, logDate],
    )

    const result = await db.select<DbDevDailyLog[]>(
      `SELECT ${DB_COLUMNS.DEV_DAILY_LOGS.join(', ')} FROM dev_daily_logs
       WHERE log_date = ?`,
      [logDate],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to update dev daily log: record not found after update',
      )
    }

    return mapDbDevDailyLogToDevDailyLog(result[0])
  } catch (err) {
    handleDbError(err, 'update dev daily log')
  }
}

export async function deleteDevDailyLog(logDate: string): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM dev_daily_logs WHERE log_date = ?',
      [logDate],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Dev daily log not found')
    }
  } catch (err) {
    handleDbError(err, 'delete dev daily log')
  }
}
