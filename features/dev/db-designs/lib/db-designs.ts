import { getDatabase, handleDbError } from '@/lib/db'
import type { ProjectDbDesign } from '../types/project-db-design'

export class DbDesignError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DbDesignError'
  }
}

interface DbProjectDbDesign {
  id: number
  project_id: number
  content: string
  updated_at: string
}

function mapDbToDbDesign(row: DbProjectDbDesign): ProjectDbDesign {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content,
    updatedAt: row.updated_at,
  }
}

export async function getProjectDbDesign(
  projectId: number,
): Promise<ProjectDbDesign | null> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbProjectDbDesign[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_db_designs
       WHERE project_id = ?`,
      [projectId],
    )
    if (result.length === 0) return null
    return mapDbToDbDesign(result[0])
  } catch (err) {
    handleDbError(err, 'get project db design')
  }
}

export async function upsertProjectDbDesign(
  projectId: number,
  content: string,
): Promise<ProjectDbDesign> {
  const db = await getDatabase()
  try {
    await db.execute(
      `INSERT INTO dev_project_db_designs (project_id, content, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (project_id) DO UPDATE SET
         content = excluded.content,
         updated_at = CURRENT_TIMESTAMP`,
      [projectId, content],
    )
    const result = await db.select<DbProjectDbDesign[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_db_designs
       WHERE project_id = ?`,
      [projectId],
    )
    if (result.length === 0) {
      throw new DbDesignError(
        'Upsert succeeded but project db design row not found',
      )
    }
    return mapDbToDbDesign(result[0])
  } catch (err) {
    if (err instanceof DbDesignError) throw err
    handleDbError(err, 'upsert project db design')
  }
}
