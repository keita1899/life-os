import { getDatabase } from '../db'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'

interface DbTask {
  id: number
  title: string
  execution_date: string | null
  completed: number
  order: number
  actual_time: number
  estimated_time: number | null
  created_at: string
  updated_at: string
}

function mapDbTaskToTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    executionDate: dbTask.execution_date,
    completed: dbTask.completed === 1,
    order: dbTask.order,
    actualTime: dbTask.actual_time,
    estimatedTime: dbTask.estimated_time,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
  }
}

async function getMaxOrder(): Promise<number> {
  const db = await getDatabase()
  const result = await db.select<{ max_order: number | null }[]>(
    'SELECT MAX("order") as max_order FROM tasks',
  )
  return result[0]?.max_order ?? -1
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const db = await getDatabase()

  const maxOrder = await getMaxOrder()
  const newOrder = maxOrder + 1

  try {
    await db.execute(
      `INSERT INTO tasks (title, execution_date, estimated_time, "order")
       VALUES (?, ?, ?, ?)`,
      [
        input.title,
        input.executionDate || null,
        input.estimatedTime || null,
        newOrder,
      ],
    )

    const result = await db.select<DbTask[]>(
      `SELECT * FROM tasks 
       WHERE title = ? AND "order" = ?
       ORDER BY created_at DESC, id DESC 
       LIMIT 1`,
      [input.title, newOrder],
    )

    if (result.length === 0) {
      throw new Error('Failed to create task: record not found after insert')
    }

    return mapDbTaskToTask(result[0])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to create task: unknown error')
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTask[]>(
      'SELECT * FROM tasks ORDER BY "order" ASC, created_at ASC',
    )

    return result.map(mapDbTaskToTask)
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to get tasks: unknown error')
  }
}

export async function updateTask(
  id: number,
  input: UpdateTaskInput,
): Promise<Task> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.title !== undefined) {
    updateFields.push('title = ?')
    updateValues.push(input.title)
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
    const result = await db.select<DbTask[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [id],
    )
    if (result.length === 0) {
      throw new Error('Task not found')
    }
    return mapDbTaskToTask(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbTask[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update task: record not found after update')
    }

    return mapDbTaskToTask(result[0])
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to update task: unknown error')
  }
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM tasks WHERE id = ?', [id])

    if (result.rowsAffected === 0) {
      throw new Error('Task not found')
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to delete task: unknown error')
  }
}

export async function deleteCompletedTasks(): Promise<number> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM tasks WHERE completed = 1')
    return result.rowsAffected
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Failed to delete completed tasks: unknown error')
  }
}
