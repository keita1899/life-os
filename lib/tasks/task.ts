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
