import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'

import type { RecurrenceRule } from '@/features/events'

const TASK_UPDATE_MAPPING: FieldMapping<UpdateTaskInput> = [
  { key: 'title', column: 'title' },
  { key: 'executionDate', column: 'execution_date', transform: (v) => v || null },
  { key: 'completed', column: 'completed', transform: (v) => (v ? 1 : 0) },
  { key: 'order', column: '"order"' },
  {
    key: 'scheduledTime',
    column: 'scheduled_time',
    transform: (v) =>
      typeof v === 'string' && v.trim() !== '' ? v.trim() : null,
  },
  { key: 'recurrenceRule', column: 'recurrence_rule', transform: (v) => v || null },
  {
    key: 'recurrenceDaysOfWeek',
    column: 'recurrence_days_of_week',
    transform: (v) =>
      Array.isArray(v) && v.length > 0 ? v.join(',') : null,
  },
  { key: 'recurrenceDayOfMonth', column: 'recurrence_day_of_month' },
  { key: 'recurrenceEndDate', column: 'recurrence_end_date', transform: (v) => v || null },
  {
    key: 'recurrenceExcludedDates',
    column: 'recurrence_excluded_dates',
    transform: (v) =>
      Array.isArray(v) && v.length > 0 ? JSON.stringify(v) : null,
  },
  { key: 'memo', column: 'memo', transform: (v) => v ?? null },
]

interface DbTask {
  id: number
  title: string
  execution_date: string | null
  completed: number
  order: number
  scheduled_time: string | null
  recurrence_rule: string | null
  recurrence_days_of_week: string | null
  recurrence_day_of_month: number | null
  recurrence_end_date: string | null
  recurrence_excluded_dates: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

function mapDbTaskToTask(dbTask: DbTask): Task {
  let daysOfWeek: number[] | null = null
  if (dbTask.recurrence_days_of_week) {
    daysOfWeek = dbTask.recurrence_days_of_week
      .split(',')
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n))
  }

  let excludedDates: string[] = []
  if (dbTask.recurrence_excluded_dates) {
    try {
      excludedDates = JSON.parse(dbTask.recurrence_excluded_dates)
    } catch {
      excludedDates = []
    }
  }

  return {
    id: dbTask.id,
    title: dbTask.title,
    executionDate: dbTask.execution_date,
    completed: dbTask.completed === 1,
    order: dbTask.order,
    scheduledTime: dbTask.scheduled_time,
    recurrenceRule: dbTask.recurrence_rule as RecurrenceRule | null,
    recurrenceDaysOfWeek: daysOfWeek,
    recurrenceDayOfMonth: dbTask.recurrence_day_of_month,
    recurrenceEndDate: dbTask.recurrence_end_date,
    recurrenceExcludedDates: excludedDates,
    memo: dbTask.memo ?? null,
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

  const daysOfWeekStr =
    input.recurrenceDaysOfWeek?.length
      ? input.recurrenceDaysOfWeek.join(',')
      : null

  try {
    await db.execute(
      `INSERT INTO tasks (title, execution_date, "order", scheduled_time, recurrence_rule, recurrence_days_of_week, recurrence_day_of_month, recurrence_end_date, recurrence_excluded_dates, memo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.executionDate || null,
        newOrder,
        input.scheduledTime || null,
        input.recurrenceRule || null,
        daysOfWeekStr,
        input.recurrenceDayOfMonth ?? null,
        input.recurrenceEndDate || null,
        null,
        input.memo ?? null,
      ],
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

  const params = buildUpdateParams(input, TASK_UPDATE_MAPPING)

  if (params === null) {
    try {
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
    } catch (err) {
      handleDbError(err, 'update task')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE tasks SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
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
    const overdueTasks = await db.select<DbTask[]>(
      `SELECT ${DB_COLUMNS.TASKS.map((col) =>
        col === 'order' ? '"order"' : col,
      ).join(', ')} FROM tasks 
       WHERE completed = 0 
       AND execution_date IS NOT NULL 
       AND execution_date < ?`,
      [today],
    )

    let updatedCount = 0

    for (const dbTask of overdueTasks) {
      const task = mapDbTaskToTask(dbTask)
      
      if (task.recurrenceRule) {
        const currentExcludedDates = task.recurrenceExcludedDates || []
        if (task.executionDate && !currentExcludedDates.includes(task.executionDate)) {
          const newExcludedDates = [...currentExcludedDates, task.executionDate]
          await db.execute(
            `UPDATE tasks 
             SET recurrence_excluded_dates = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [
              newExcludedDates.length > 0
                ? JSON.stringify(newExcludedDates)
                : null,
              task.id,
            ],
          )
          updatedCount++
        }
      } else {
        await db.execute(
          `UPDATE tasks 
           SET execution_date = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [today, task.id],
        )
        updatedCount++
      }
    }

    return updatedCount
  } catch (err) {
    handleDbError(err, 'update overdue tasks to today')
  }
}
