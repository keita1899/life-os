import { getDatabase, handleDbError } from '@/lib/db'
import type { ProjectRequirements } from '../types/project-requirements'

interface DbProjectRequirements {
  id: number
  project_id: number
  content: string
  updated_at: string
}

function mapDbToRequirements(row: DbProjectRequirements): ProjectRequirements {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content,
    updatedAt: row.updated_at,
  }
}

export async function getProjectRequirements(
  projectId: number,
): Promise<ProjectRequirements | null> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbProjectRequirements[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_requirements
       WHERE project_id = ?`,
      [projectId],
    )
    if (result.length === 0) return null
    return mapDbToRequirements(result[0])
  } catch (err) {
    handleDbError(err, 'get project requirements')
  }
}

export async function upsertProjectRequirements(
  projectId: number,
  content: string,
): Promise<ProjectRequirements> {
  const db = await getDatabase()
  try {
    const existing = await db.select<DbProjectRequirements[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_requirements
       WHERE project_id = ?`,
      [projectId],
    )
    if (existing.length > 0) {
      await db.execute(
        `UPDATE dev_project_requirements
         SET content = ?, updated_at = CURRENT_TIMESTAMP
         WHERE project_id = ?`,
        [content, projectId],
      )
      const updated = await db.select<DbProjectRequirements[]>(
        `SELECT id, project_id, content, updated_at
         FROM dev_project_requirements
         WHERE project_id = ?`,
        [projectId],
      )
      if (updated.length === 0) {
        throw new Error(
          'Failed to update project requirements: record not found',
        )
      }
      return mapDbToRequirements(updated[0])
    }
    const insertResult = await db.execute(
      `INSERT INTO dev_project_requirements (project_id, content)
       VALUES (?, ?)`,
      [projectId, content],
    )
    const lastId =
      typeof insertResult?.lastInsertId === 'number'
        ? insertResult.lastInsertId
        : undefined
    if (lastId === undefined) {
      const fallback = await db.select<DbProjectRequirements[]>(
        `SELECT id, project_id, content, updated_at
         FROM dev_project_requirements
         WHERE project_id = ?
         ORDER BY id DESC LIMIT 1`,
        [projectId],
      )
      if (fallback.length === 0) {
        throw new Error(
          'Failed to create project requirements: record not found after insert',
        )
      }
      return mapDbToRequirements(fallback[0])
    }
    const created = await db.select<DbProjectRequirements[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_requirements
       WHERE id = ?`,
      [lastId],
    )
    if (created.length === 0) {
      throw new Error(
        'Failed to create project requirements: record not found after insert',
      )
    }
    return mapDbToRequirements(created[0])
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith('Failed to ')
    ) {
      throw err
    }
    handleDbError(err, 'upsert project requirements')
  }
}
