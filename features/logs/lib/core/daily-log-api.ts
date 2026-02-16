import { getDatabase, handleDbError } from '@/lib/db'
import { DB_COLUMNS } from '@/lib/db/constants'

interface DailyLogConfig {
  table: string
  columns: readonly string[]
  contentColumn: 'diary' | 'report'
  errorContext: string
}

export interface DailyLogShape {
  id: number
  logDate: string
  content: string | null
  createdAt: string
  updatedAt: string
}

interface DbRow {
  id: number
  log_date: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

function mapRow(row: DbRow, contentColumn: string): DailyLogShape {
  return {
    id: row.id,
    logDate: row.log_date,
    content: (row[contentColumn] as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

interface CreateInput {
  logDate: string
  content?: string | null
}

interface UpdateInput {
  content?: string | null
}

export function createDailyLogApi(config: DailyLogConfig) {
  const { table, columns, contentColumn, errorContext } = config
  const cols = columns.join(', ')

  return {
    async getByDate(logDate: string): Promise<DailyLogShape | null> {
      const db = await getDatabase()
      try {
        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE log_date = ? LIMIT 1`,
          [logDate],
        )
        if (result.length === 0) return null
        return mapRow(result[0], contentColumn)
      } catch (err) {
        handleDbError(err, errorContext)
      }
    },

    async create(input: CreateInput): Promise<DailyLogShape> {
      const db = await getDatabase()
      try {
        await db.execute(
          `INSERT INTO ${table} (log_date, ${contentColumn}) VALUES (?, ?)`,
          [input.logDate, input.content ?? null],
        )
        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE log_date = ? LIMIT 1`,
          [input.logDate],
        )
        if (result.length === 0) {
          throw new Error('Failed to create daily log: record not found after insert')
        }
        return mapRow(result[0], contentColumn)
      } catch (err) {
        handleDbError(err, errorContext)
      }
    },

    async update(logDate: string, input: UpdateInput): Promise<DailyLogShape> {
      const db = await getDatabase()
      try {
        if ('content' in input && input.content !== undefined) {
          await db.execute(
            `UPDATE ${table} SET ${contentColumn} = ?, updated_at = CURRENT_TIMESTAMP WHERE log_date = ?`,
            [input.content ?? null, logDate],
          )
        } else {
          await db.execute(
            `UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE log_date = ?`,
            [logDate],
          )
        }
        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE log_date = ?`,
          [logDate],
        )
        if (result.length === 0) {
          throw new Error('Failed to update daily log: record not found after update')
        }
        return mapRow(result[0], contentColumn)
      } catch (err) {
        handleDbError(err, errorContext)
      }
    },

    async delete(logDate: string): Promise<void> {
      const db = await getDatabase()
      try {
        const result = await db.execute(
          `DELETE FROM ${table} WHERE log_date = ?`,
          [logDate],
        )
        if (result.rowsAffected === 0) {
          throw new Error('Daily log not found')
        }
      } catch (err) {
        handleDbError(err, errorContext)
      }
    },
  }
}

export const LIFE_DAILY_LOG_CONFIG: DailyLogConfig = {
  table: 'daily_logs',
  columns: DB_COLUMNS.DAILY_LOGS,
  contentColumn: 'diary',
  errorContext: 'daily log',
}

export const DEV_DAILY_LOG_CONFIG: DailyLogConfig = {
  table: 'dev_daily_logs',
  columns: DB_COLUMNS.DEV_DAILY_LOGS,
  contentColumn: 'report',
  errorContext: 'dev daily log',
}
