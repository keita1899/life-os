import { getDatabase, handleDbError } from '@/lib/db'
import type { ProjectReadme } from '../types/project-readme'

export class ReadmeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReadmeError'
  }
}

interface DbProjectReadme {
  id: number
  project_id: number
  content: string
  updated_at: string
}

function mapDbToReadme(row: DbProjectReadme): ProjectReadme {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content,
    updatedAt: row.updated_at,
  }
}

export async function getProjectReadme(
  projectId: number,
): Promise<ProjectReadme | null> {
  const db = await getDatabase()
  try {
    const result = await db.select<DbProjectReadme[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_readmes
       WHERE project_id = ?`,
      [projectId],
    )
    if (result.length === 0) return null
    return mapDbToReadme(result[0])
  } catch (err) {
    handleDbError(err, 'get project readme')
  }
}

export async function upsertProjectReadme(
  projectId: number,
  content: string,
): Promise<ProjectReadme> {
  const db = await getDatabase()
  try {
    await db.execute(
      `INSERT INTO dev_project_readmes (project_id, content, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (project_id) DO UPDATE SET
         content = excluded.content,
         updated_at = CURRENT_TIMESTAMP`,
      [projectId, content],
    )
    const result = await db.select<DbProjectReadme[]>(
      `SELECT id, project_id, content, updated_at
       FROM dev_project_readmes
       WHERE project_id = ?`,
      [projectId],
    )
    if (result.length === 0) {
      throw new ReadmeError(
        'Upsert succeeded but project readme row not found',
      )
    }
    return mapDbToReadme(result[0])
  } catch (err) {
    if (err instanceof ReadmeError) throw err
    handleDbError(err, 'upsert project readme')
  }
}
