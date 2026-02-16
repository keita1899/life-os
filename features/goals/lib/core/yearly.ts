import { getDatabase, handleDbError } from '@/lib/db'
import type { ChecklistItem } from '@/features/goals'
import type { GoalsTableConfig } from './config'
import type {
  YearlyGoalShape,
  CreateYearlyGoalInputShape,
  UpdateYearlyGoalInputShape,
} from './types'

interface DbRow {
  id: number
  title: string
  year: number
  achieved: number
  checklist: string | null
  created_at: string
  updated_at: string
}

function parseChecklist(checklistJson: string | null): ChecklistItem[] {
  if (!checklistJson) return []
  try {
    const parsed = JSON.parse(checklistJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mapRow(row: DbRow): YearlyGoalShape {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    achieved: row.achieved === 1,
    checklist: parseChecklist(row.checklist),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createYearlyGoalsApi(config: GoalsTableConfig) {
  const { table, columns } = config.yearly
  const cols = columns.join(', ')

  async function countByYear(
    year: number,
    excludeId?: number,
  ): Promise<number> {
    const db = await getDatabase()
    const excludeClause = excludeId ? 'AND id != ?' : ''
    const params: unknown[] = [year]
    if (excludeId) params.push(excludeId)
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM ${table} WHERE year = ? ${excludeClause}`,
      params,
    )
    return result[0]?.count || 0
  }

  async function validateLimit(year: number, excludeId?: number): Promise<void> {
    const count = await countByYear(year, excludeId)
    if (count >= 1) {
      throw new Error(`${year}年の年間目標は1つまで設定できます`)
    }
  }

  const api = {
    async create(input: CreateYearlyGoalInputShape): Promise<YearlyGoalShape> {
      const db = await getDatabase()
      const year = input.year ?? new Date().getFullYear()
      await validateLimit(year)

      try {
        const checklistJson = input.checklist
          ? JSON.stringify(input.checklist)
          : null
        await db.execute(
          `INSERT INTO ${table} (title, year, checklist) VALUES (?, ?, ?)`,
          [input.title, year, checklistJson],
        )

        const result = await db.select<DbRow[]>(
          `SELECT ${cols} FROM ${table} WHERE title = ? AND year = ? ORDER BY created_at DESC, id DESC LIMIT 1`,
          [input.title, year],
        )
        if (result.length === 0) {
          throw new Error('Failed to create yearly goal: record not found after insert')
        }
        return mapRow(result[0])
      } catch (err) {
        if (
          err instanceof Error &&
          err.message.includes('UNIQUE constraint failed')
        ) {
          throw new Error(`${year}年の年間目標は1つまで設定できます`)
        }
        handleDbError(err, config.errorContext)
      }
    },

    async getById(id: number): Promise<YearlyGoalShape | null> {
      const db = await getDatabase()
      const result = await db.select<DbRow[]>(
        `SELECT ${cols} FROM ${table} WHERE id = ?`,
        [id],
      )
      return result.length === 0 ? null : mapRow(result[0])
    },

    async getByYear(year: number): Promise<YearlyGoalShape[]> {
      const db = await getDatabase()
      const result = await db.select<DbRow[]>(
        `SELECT ${cols} FROM ${table} WHERE year = ? ORDER BY created_at DESC`,
        [year],
      )
      return result.map(mapRow)
    },

    async toggleAchievement(id: number): Promise<YearlyGoalShape> {
      const db = await getDatabase()
      const current = await api.getById(id)
      if (!current) throw new Error('Yearly goal not found')

      await db.execute(
        `UPDATE ${table} SET achieved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [current.achieved ? 0 : 1, id],
      )

      const updated = await api.getById(id)
      if (!updated) throw new Error('Yearly goal not found')
      return updated
    },

    async update(id: number, input: UpdateYearlyGoalInputShape): Promise<YearlyGoalShape> {
      const db = await getDatabase()
      const current = await api.getById(id)
      if (!current) throw new Error('Yearly goal not found')

      const newYear = input.year ?? current.year
      if (newYear !== current.year) await validateLimit(newYear, id)

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
      if (input.checklist !== undefined) {
        updates.push('checklist = ?')
        values.push(input.checklist ? JSON.stringify(input.checklist) : null)
      }
      if (updates.length === 0) return current

      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)
      await db.execute(
        `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`,
        values,
      )

      const updated = await api.getById(id)
      if (!updated) throw new Error('Yearly goal not found')
      return updated
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
