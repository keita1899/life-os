import { getDatabase, handleDbError } from '@/lib/db'
import { getYearFromDate } from '../base'
import type { GoalsTableConfig } from './config'
import type {
  WeeklyGoalShape,
  CreateWeeklyGoalInputShape,
  UpdateWeeklyGoalInputShape,
} from './types'

interface DbRow {
  id: number
  title: string
  year: number
  week_start_date: string
  achieved: number
  created_at: string
  updated_at: string
}

function mapRow(row: DbRow): WeeklyGoalShape {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    weekStartDate: row.week_start_date,
    achieved: row.achieved === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createWeeklyGoalsApi(config: GoalsTableConfig) {
  const { table, columns } = config.weekly
  const cols = columns.join(', ')

  async function countByWeekStart(
    year: number,
    weekStartDate: string,
    excludeId?: number,
  ): Promise<number> {
    const db = await getDatabase()
    const excludeClause = excludeId ? 'AND id != ?' : ''
    const params: unknown[] = [year, weekStartDate]
    if (excludeId) params.push(excludeId)
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM ${table} WHERE year = ? AND week_start_date = ? ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  }

  async function validateLimit(
    year: number,
    weekStartDate: string,
    excludeId?: number,
  ): Promise<void> {
    const count = await countByWeekStart(year, weekStartDate, excludeId)
    if (count >= 1) {
      throw new Error(
        `${weekStartDate}から始まる週の週間目標は1つまで設定できます`,
      )
    }
  }

  const api = {
    async create(input: CreateWeeklyGoalInputShape): Promise<WeeklyGoalShape> {
      const db = await getDatabase()
      const weekStartDate = input.weekStartDate
      const year = getYearFromDate(weekStartDate)
      await validateLimit(year, weekStartDate)

      try {
        await db.execute(
          `INSERT INTO ${table} (title, year, week_start_date) VALUES (?, ?, ?)`,
          [input.title, year, weekStartDate],
        )

        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE title = ? AND year = ? AND week_start_date = ? ORDER BY created_at DESC, id DESC LIMIT 1`,
          [input.title, year, weekStartDate],
        )
        if (result.length === 0) {
          throw new Error('Failed to create weekly goal: record not found after insert')
        }
        return mapRow(result[0])
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },

    async getById(id: number): Promise<WeeklyGoalShape | null> {
      const db = await getDatabase()
      try {
        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE id = ?`,
          [id],
        )
        return result.length === 0 ? null : mapRow(result[0])
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },

    async getByYear(year: number): Promise<WeeklyGoalShape[]> {
      const db = await getDatabase()
      try {
        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE year = ? ORDER BY week_start_date ASC, created_at DESC`,
          [year],
        )
        return result.map(mapRow)
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },

    async getByWeekStart(weekStartDate: string): Promise<WeeklyGoalShape | null> {
      const db = await getDatabase()
      try {
        const year = getYearFromDate(weekStartDate)
        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE year = ? AND week_start_date = ? LIMIT 1`,
          [year, weekStartDate],
        )
        return result.length === 0 ? null : mapRow(result[0])
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },

    async toggleAchievement(id: number): Promise<WeeklyGoalShape> {
      const db = await getDatabase()
      try {
        const current = await api.getById(id)
        if (!current) throw new Error('Weekly goal not found')

        await db.execute(
          `UPDATE ${table} SET achieved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [current.achieved ? 0 : 1, id],
        )

        const updated = await api.getById(id)
        if (!updated) throw new Error('Weekly goal not found')
        return updated
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },

    async update(id: number, input: UpdateWeeklyGoalInputShape): Promise<WeeklyGoalShape> {
      const db = await getDatabase()
      try {
        const current = await api.getById(id)
        if (!current) throw new Error('Weekly goal not found')

        const newWeekStartDate = input.weekStartDate ?? current.weekStartDate
        const derivedYear = getYearFromDate(newWeekStartDate)

        if (input.year !== undefined && input.year !== derivedYear) {
          throw new Error(
            `指定された年(${input.year}年)は週開始日(${newWeekStartDate})の年(${derivedYear}年)と一致しません`,
          )
        }
        const newYear = derivedYear

        if (
          newYear !== current.year ||
          newWeekStartDate !== current.weekStartDate
        ) {
          await validateLimit(newYear, newWeekStartDate, id)
        }

        const updates: string[] = []
        const values: unknown[] = []
        if (input.title !== undefined) {
          updates.push('title = ?')
          values.push(input.title)
        }
        if (newYear !== current.year) {
          updates.push('year = ?')
          values.push(newYear)
        }
        if (input.weekStartDate !== undefined) {
          updates.push('week_start_date = ?')
          values.push(input.weekStartDate)
        }
        if (updates.length === 0) return current

        updates.push('updated_at = CURRENT_TIMESTAMP')
        values.push(id)
        await db.execute(
          `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`,
          values,
        )

        const updated = await api.getById(id)
        if (!updated) throw new Error('Weekly goal not found')
        return updated
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },

    async delete(id: number): Promise<void> {
      const db = await getDatabase()
      try {
        await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id])
      } catch (err) {
        handleDbError(err, config.errorContext)
      }
    },
  }
  return api
}
