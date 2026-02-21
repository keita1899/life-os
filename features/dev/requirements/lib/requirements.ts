import { getDatabase, handleDbError } from '@/lib/db'
import type { ProjectRequirements } from '../types/project-requirements'

export class RequirementsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequirementsError'
  }
}

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
    await db.execute(
      `INSERT INTO dev_project_requirements (project_id, content, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (project_id) DO UPDATE SET
         content = excluded.content,
         updated_at = CURRENT_TIMESTAMP`,
      [projectId, content],
    )
    const result = await db.select<DbProjectRequirements[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_requirements
       WHERE project_id = ?`,
      [projectId],
    )
    if (result.length === 0) {
      throw new RequirementsError(
        'Upsert succeeded but project requirements row not found',
      )
    }
    return mapDbToRequirements(result[0])
  } catch (err) {
    if (err instanceof RequirementsError) throw err
    handleDbError(err, 'upsert project requirements')
  }
}
