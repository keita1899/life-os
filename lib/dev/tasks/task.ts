import { getDatabase, handleDbError } from '@/lib/db'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  DevTask,
  CreateDevTaskInput,
  UpdateDevTaskInput,
} from '@/lib/types/dev-task'

interface DbDevTask {
  id: number
  title: string
  project_id: number | null
  type: 'inbox' | 'learning'
  execution_date: string | null
  completed: number
  order: number
  actual_time: number
  estimated_time: number | null
  created_at: string
  updated_at: string
}

function mapDbDevTaskToDevTask(dbTask: DbDevTask): DevTask {
  return {
    id: dbTask.id,
    title: dbTask.title,
    projectId: dbTask.project_id,
    type: dbTask.type,
    executionDate: dbTask.execution_date,
    completed: dbTask.completed === 1,
    order: dbTask.order,
    actualTime: dbTask.actual_time,
    estimatedTime: dbTask.estimated_time,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
  }
}

function getSelectColumns(): string {
  return DB_COLUMNS.DEV_TASKS.map((col) => (col === 'order' ? '"order"' : col)).join(
    ', ',
  )
}

async function getMaxOrder(
  projectId: number | null,
  type: DbDevTask['type'],
): Promise<number> {
  const db = await getDatabase()

  const where = projectId === null ? 'project_id IS NULL' : 'project_id = ?'
  const values = projectId === null ? [type] : [projectId, type]

  const result = await db.select<{ max_order: number | null }[]>(
    `SELECT MAX("order") as max_order FROM dev_tasks
     WHERE ${where} AND type = ?`,
    values,
  )
  return result[0]?.max_order ?? -1
}

export async function createDevTask(input: CreateDevTaskInput): Promise<DevTask> {
  const db = await getDatabase()

  const maxOrder = await getMaxOrder(input.projectId, input.type)
  const newOrder = maxOrder + 1

  try {
    await db.execute(
      `INSERT INTO dev_tasks (title, project_id, type, execution_date, estimated_time, "order")
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.projectId,
        input.type,
        input.executionDate || null,
        input.estimatedTime || null,
        newOrder,
      ],
    )

    const whereProject = input.projectId === null ? 'project_id IS NULL' : 'project_id = ?'
    const values =
      input.projectId === null
        ? [input.title, input.type, newOrder]
        : [input.title, input.projectId, input.type, newOrder]

    const result = await db.select<DbDevTask[]>(
      `SELECT ${getSelectColumns()} FROM dev_tasks
       WHERE title = ? AND ${whereProject} AND type = ? AND "order" = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      values,
    )

    if (result.length === 0) {
      throw new Error('Failed to create dev task: record not found after insert')
    }

    return mapDbDevTaskToDevTask(result[0])
  } catch (err) {
    handleDbError(err, 'create dev task')
  }
}

export async function getDevTasks(input: {
  projectId: number | null
  type?: DbDevTask['type']
}): Promise<DevTask[]> {
  const db = await getDatabase()

  const whereProject = input.projectId === null ? 'project_id IS NULL' : 'project_id = ?'
  const whereType = input.type ? ' AND type = ?' : ''
  const values: unknown[] =
    input.projectId === null ? [] : [input.projectId]
  if (input.type) {
    values.push(input.type)
  }

  try {
    const result = await db.select<DbDevTask[]>(
      `SELECT ${getSelectColumns()} FROM dev_tasks
       WHERE ${whereProject}${whereType}
       ORDER BY "order" ASC, created_at ASC`,
      values,
    )

    return result.map(mapDbDevTaskToDevTask)
  } catch (err) {
    handleDbError(err, 'get dev tasks')
  }
}

export async function getAllDevTasks(): Promise<DevTask[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbDevTask[]>(
      `SELECT ${getSelectColumns()} FROM dev_tasks ORDER BY "order" ASC, created_at ASC`,
    )
    return result.map(mapDbDevTaskToDevTask)
  } catch (err) {
    handleDbError(err, 'get all dev tasks')
  }
}

export async function updateDevTask(
  id: number,
  input: UpdateDevTaskInput,
): Promise<DevTask> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.title !== undefined) {
    updateFields.push('title = ?')
    updateValues.push(input.title)
  }

  if (input.projectId !== undefined) {
    updateFields.push('project_id = ?')
    updateValues.push(input.projectId)
  }

  if (input.type !== undefined) {
    updateFields.push('type = ?')
    updateValues.push(input.type)
  }

  if (input.executionDate !== undefined) {
    updateFields.push('execution_date = ?')
    updateValues.push(input.executionDate || null)
  }

  if (input.completed !== undefined) {
    updateFields.push('completed = ?')
    updateValues.push(input.completed ? 1 : 0)
  }

  if (input.order !== undefined) {
    updateFields.push('"order" = ?')
    updateValues.push(input.order)
  }

  if (input.actualTime !== undefined) {
    updateFields.push('actual_time = ?')
    updateValues.push(input.actualTime)
  }

  if (input.estimatedTime !== undefined) {
    updateFields.push('estimated_time = ?')
    updateValues.push(input.estimatedTime || null)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbDevTask[]>(
      `SELECT ${getSelectColumns()} FROM dev_tasks WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Task not found')
    }
    return mapDbDevTaskToDevTask(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE dev_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbDevTask[]>(
      `SELECT ${getSelectColumns()} FROM dev_tasks WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update dev task: record not found after update')
    }

    return mapDbDevTaskToDevTask(result[0])
  } catch (err) {
    handleDbError(err, 'update dev task')
  }
}

export async function deleteDevTask(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM dev_tasks WHERE id = ?', [id])
    if (result.rowsAffected === 0) {
      throw new Error('Task not found')
    }
  } catch (err) {
    handleDbError(err, 'delete dev task')
  }
}

export async function deleteCompletedDevTasks(input: {
  projectId: number | null
  type?: DbDevTask['type']
}): Promise<number> {
  const db = await getDatabase()

  const whereProject = input.projectId === null ? 'project_id IS NULL' : 'project_id = ?'
  const whereType = input.type ? ' AND type = ?' : ''
  const values: unknown[] = input.projectId === null ? [] : [input.projectId]
  if (input.type) {
    values.push(input.type)
  }

  try {
    const result = await db.execute(
      `DELETE FROM dev_tasks
       WHERE completed = 1 AND ${whereProject}${whereType}`,
      values,
    )
    return result.rowsAffected
  } catch (err) {
    handleDbError(err, 'delete completed dev tasks')
  }
}

