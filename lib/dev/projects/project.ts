import { getDatabase, handleDbError } from '../../db'
import type {
  DevProject,
  CreateDevProjectInput,
  UpdateDevProjectInput,
  ProjectStatus,
} from '../../types/dev-project'

interface DbDevProject {
  id: number
  name: string
  start_date: string | null
  end_date: string | null
  status: string
  created_at: string
  updated_at: string
}

function mapDbProjectToProject(dbProject: DbDevProject): DevProject {
  return {
    id: dbProject.id,
    name: dbProject.name,
    startDate: dbProject.start_date,
    endDate: dbProject.end_date,
    status: dbProject.status as ProjectStatus,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
  }
}

async function getUnreleasedProjectCount(): Promise<number> {
  const db = await getDatabase()
  try {
    const result = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count 
       FROM dev_projects 
       WHERE status IN ('draft', 'in_progress')`,
    )
    return result[0]?.count ?? 0
  } catch (err) {
    handleDbError(err, 'get unreleased project count')
  }
}

export async function getAllDevProjects(): Promise<DevProject[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbDevProject[]>(
      `SELECT 
        id,
        name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      FROM dev_projects
      ORDER BY created_at DESC`,
    )

    return result.map(mapDbProjectToProject)
  } catch (err) {
    handleDbError(err, 'get dev projects')
  }
}

export async function getDevProjectById(id: number): Promise<DevProject | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbDevProject[]>(
      `SELECT 
        id,
        name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      FROM dev_projects
      WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbProjectToProject(result[0])
  } catch (err) {
    handleDbError(err, 'get dev project by id')
  }
}

export async function createDevProject(
  input: CreateDevProjectInput,
): Promise<DevProject> {
  const db = await getDatabase()

  const status = input.status ?? 'draft'
  const isUnreleased = status === 'draft' || status === 'in_progress'

  if (isUnreleased) {
    const unreleasedCount = await getUnreleasedProjectCount()
    if (unreleasedCount >= 3) {
      throw new Error('未リリースのプロジェクトは3つまで作成できます')
    }
  }

  try {
    await db.execute(
      `INSERT INTO dev_projects (name, start_date, end_date, status)
       VALUES (?, ?, ?, ?)`,
      [input.name, input.startDate || null, input.endDate || null, status],
    )

    const result = await db.select<DbDevProject[]>(
      `SELECT 
        id,
        name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      FROM dev_projects
      WHERE name = ? AND status = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1`,
      [input.name, status],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create dev project: record not found after insert',
      )
    }

    return mapDbProjectToProject(result[0])
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('未リリースのプロジェクトは3つまで')
    ) {
      throw err
    }
    handleDbError(err, 'create dev project')
  }
}

export async function updateDevProject(
  id: number,
  input: UpdateDevProjectInput,
): Promise<DevProject> {
  const db = await getDatabase()

  const currentProject = await getDevProjectById(id)
  if (!currentProject) {
    throw new Error('Project not found')
  }

  const newStatus = input.status ?? currentProject.status
  const isUnreleased = newStatus === 'draft' || newStatus === 'in_progress'
  const wasUnreleased =
    currentProject.status === 'draft' ||
    currentProject.status === 'in_progress'

  if (isUnreleased && !wasUnreleased) {
    const unreleasedCount = await getUnreleasedProjectCount()
    if (unreleasedCount >= 3) {
      throw new Error('未リリースのプロジェクトは3つまで作成できます')
    }
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (input.name !== undefined) {
    updates.push('name = ?')
    values.push(input.name)
  }

  if (input.startDate !== undefined) {
    updates.push('start_date = ?')
    values.push(input.startDate || null)
  }

  if (input.endDate !== undefined) {
    updates.push('end_date = ?')
    values.push(input.endDate || null)
  }

  if (input.status !== undefined) {
    updates.push('status = ?')
    values.push(input.status)
  }

  if (updates.length === 0) {
    return currentProject
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  try {
    await db.execute(
      `UPDATE dev_projects 
       SET ${updates.join(', ')} 
       WHERE id = ?`,
      values,
    )

    const updated = await getDevProjectById(id)
    if (!updated) {
      throw new Error('Failed to update dev project: record not found')
    }

    return updated
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('未リリースのプロジェクトは3つまで')
    ) {
      throw err
    }
    handleDbError(err, 'update dev project')
  }
}

export async function deleteDevProject(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM dev_projects WHERE id = ?', [
      id,
    ])

    if (result.rowsAffected === 0) {
      throw new Error('Project not found')
    }
  } catch (err) {
    handleDbError(err, 'delete dev project')
  }
}
