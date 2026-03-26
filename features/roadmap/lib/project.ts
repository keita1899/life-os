import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  RoadmapProject,
  CreateRoadmapProjectInput,
  UpdateRoadmapProjectInput,
} from '../types/roadmap-project'

interface DbRoadmapProject {
  id: number
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

function mapDbToProject(db: DbRoadmapProject): RoadmapProject {
  return {
    id: db.id,
    name: db.name,
    sortOrder: db.sort_order,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const errorStr = String(err).toLowerCase()
  const errorMessage =
    err instanceof Error ? err.message.toLowerCase() : errorStr

  return (
    errorMessage.includes('unique') ||
    errorMessage.includes('constraint') ||
    errorStr.includes('unique') ||
    errorStr.includes('constraint') ||
    (err instanceof Error &&
      (err.message.includes('19') || err.message.includes('2067')))
  )
}

export async function getAllRoadmapProjects(): Promise<RoadmapProject[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbRoadmapProject[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_PROJECTS.join(', ')} FROM roadmap_projects
       ORDER BY sort_order ASC, id ASC`,
    )

    return result.map(mapDbToProject)
  } catch (err) {
    handleDbError(err, 'get roadmap projects')
  }
}

export async function createRoadmapProject(
  input: CreateRoadmapProjectInput,
): Promise<RoadmapProject> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO roadmap_projects (name, sort_order)
       VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM roadmap_projects))`,
      [input.name],
    )

    const result = await db.select<DbRoadmapProject[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_PROJECTS.join(', ')} FROM roadmap_projects
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create roadmap project: record not found after insert')
    }

    return mapDbToProject(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name}」という名前のプロジェクトは既に存在します`)
    }

    handleDbError(err, 'create roadmap project')
  }
}

const PROJECT_UPDATE_MAPPING: FieldMapping<UpdateRoadmapProjectInput> = [
  { key: 'name', column: 'name' },
  { key: 'sortOrder', column: 'sort_order' },
]

export async function updateRoadmapProject(
  id: number,
  input: UpdateRoadmapProjectInput,
): Promise<RoadmapProject> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, PROJECT_UPDATE_MAPPING)

  if (params === null) {
    const result = await db.select<DbRoadmapProject[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_PROJECTS.join(', ')} FROM roadmap_projects
       WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Roadmap project not found')
    }
    return mapDbToProject(result[0])
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE roadmap_projects SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbRoadmapProject[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_PROJECTS.join(', ')} FROM roadmap_projects
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update roadmap project: record not found after update')
    }

    return mapDbToProject(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const projectName = input.name || ''
      throw new Error(`「${projectName}」という名前のプロジェクトは既に存在します`)
    }

    handleDbError(err, 'update roadmap project')
  }
}

export async function deleteRoadmapProject(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM roadmap_projects WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Roadmap project not found')
    }
  } catch (err) {
    handleDbError(err, 'delete roadmap project')
  }
}

export async function reorderRoadmapProjects(
  updates: { id: number; sortOrder: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, sortOrder } of updates) {
      await db.execute(
        'UPDATE roadmap_projects SET sort_order = ? WHERE id = ?',
        [sortOrder, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder roadmap projects')
  }
}
