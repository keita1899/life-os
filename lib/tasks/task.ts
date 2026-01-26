import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'

interface DbTask {
  id: number
  title: string
  execution_date: string | null
  completed: number
  order: number
  actual_time: number
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
      `INSERT INTO tasks (title, execution_date, "order")
       VALUES (?, ?, ?)`,
      [input.title, input.executionDate || null, newOrder],
    )

    const result = await db.select<DbTask[]>(
      `SELECT ${DB_COLUMNS.TASKS.map((col) =>
        col === 'order' ? '"order"' : col,
      ).join(', ')} FROM tasks 
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
    handleDbError(err, 'create task')
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTask[]>(
      `SELECT ${DB_COLUMNS.TASKS.map((col) =>
        col === 'order' ? '"order"' : col,
      ).join(', ')} FROM tasks ORDER BY "order" ASC, created_at ASC`,
    )

    return result.map(mapDbTaskToTask)
  } catch (err) {
    handleDbError(err, 'get tasks')
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

  if (updateFields.length === 0) {
    const result = await db.select<DbTask[]>(
      `SELECT ${DB_COLUMNS.TASKS.map((col) =>
        col === 'order' ? '"order"' : col,
      ).join(', ')} FROM tasks WHERE id = ?`,
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
      `SELECT ${DB_COLUMNS.TASKS.map((col) =>
        col === 'order' ? '"order"' : col,
      ).join(', ')} FROM tasks WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update task: record not found after update')
    }

    return mapDbTaskToTask(result[0])
  } catch (err) {
    handleDbError(err, 'update task')
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
    handleDbError(err, 'delete task')
  }
}

export async function deleteCompletedTasks(): Promise<number> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM tasks WHERE completed = 1')
    return result.rowsAffected
  } catch (err) {
    handleDbError(err, 'delete completed tasks')
  }
}

export async function updateOverdueTasksToToday(): Promise<number> {
  const db = await getDatabase()
  const today = new Date().toISOString().split('T')[0]

  try {
    const result = await db.execute(
      `UPDATE tasks 
       SET execution_date = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE completed = 0 
       AND execution_date IS NOT NULL 
       AND execution_date < ?`,
      [today, today],
    )
    return result.rowsAffected
  } catch (err) {
    handleDbError(err, 'update overdue tasks to today')
  }
}
