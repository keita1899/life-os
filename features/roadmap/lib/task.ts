import { getDatabase, handleDbError } from '@/lib/db'
import type {
  RoadmapTask,
  CreateRoadmapTaskInput,
  UpdateRoadmapTaskInput,
} from '../types/roadmap-task'

interface DbRoadmapTask {
  id: number
  title: string
  project_id: number
  section_id: number | null
  target_year: number | null
  target_month: number | null
  completed: number
  achieved_date: string | null
  order: number
  created_at: string
  updated_at: string
}

function mapDbToTask(db: DbRoadmapTask): RoadmapTask {
  return {
    id: db.id,
    title: db.title,
    projectId: db.project_id,
    sectionId: db.section_id,
    targetYear: db.target_year,
    targetMonth: db.target_month,
    completed: db.completed === 1,
    achievedDate: db.achieved_date,
    order: db.order,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

async function getMaxOrderInSection(
  projectId: number,
  sectionId: number | null,
): Promise<number> {
  const db = await getDatabase()
  try {
    const result = await db.select<{ max_order: number | null }[]>(
      sectionId === null
        ? 'SELECT MAX("order") as max_order FROM roadmap_tasks WHERE project_id = ? AND section_id IS NULL'
        : 'SELECT MAX("order") as max_order FROM roadmap_tasks WHERE project_id = ? AND section_id = ?',
      sectionId === null ? [projectId] : [projectId, sectionId],
    )
    return result[0]?.max_order ?? -1
  } catch (err) {
    handleDbError(err, 'get max order')
  }
}

export async function getTasksByProjectId(
  projectId: number,
): Promise<RoadmapTask[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbRoadmapTask[]>(
      `SELECT id, title, project_id, section_id, target_year, target_month,
              completed, achieved_date, "order", created_at, updated_at
       FROM roadmap_tasks
       WHERE project_id = ?
       ORDER BY "order" ASC, created_at ASC`,
      [projectId],
    )

    return result.map(mapDbToTask)
  } catch (err) {
    handleDbError(err, 'get roadmap tasks')
  }
}

export async function createRoadmapTask(
  input: CreateRoadmapTaskInput,
): Promise<RoadmapTask> {
  const db = await getDatabase()

  const sectionId = input.sectionId ?? null
  const maxOrder = await getMaxOrderInSection(input.projectId, sectionId)
  const newOrder = maxOrder + 1

  try {
    await db.execute(
      `INSERT INTO roadmap_tasks (title, project_id, section_id, target_year, target_month, "order")
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.projectId,
        sectionId,
        input.targetYear ?? null,
        input.targetMonth ?? null,
        newOrder,
      ],
    )

    const result = await db.select<DbRoadmapTask[]>(
      `SELECT id, title, project_id, section_id, target_year, target_month,
              completed, achieved_date, "order", created_at, updated_at
       FROM roadmap_tasks
       WHERE title = ? AND project_id = ? AND "order" = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.title, input.projectId, newOrder],
    )

    if (result.length === 0) {
      throw new Error('Failed to create roadmap task: record not found after insert')
    }

    return mapDbToTask(result[0])
  } catch (err) {
    handleDbError(err, 'create roadmap task')
  }
}

export async function updateRoadmapTask(
  id: number,
  input: UpdateRoadmapTaskInput,
): Promise<RoadmapTask> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.title !== undefined) {
    updateFields.push('title = ?')
    updateValues.push(input.title)
  }

  if (input.sectionId !== undefined) {
    updateFields.push('section_id = ?')
    updateValues.push(input.sectionId)
  }

  if (input.targetYear !== undefined) {
    updateFields.push('target_year = ?')
    updateValues.push(input.targetYear)
  }

  if (input.targetMonth !== undefined) {
    updateFields.push('target_month = ?')
    updateValues.push(input.targetMonth)
  }

  if (input.completed !== undefined) {
    updateFields.push('completed = ?')
    updateValues.push(input.completed ? 1 : 0)
    if (input.completed) {
      if (input.achievedDate === undefined) {
        const today = new Date().toISOString().split('T')[0]
        updateFields.push('achieved_date = ?')
        updateValues.push(today)
      }
    } else {
      if (input.achievedDate === undefined) {
        updateFields.push('achieved_date = ?')
        updateValues.push(null)
      }
    }
  }

  if (input.achievedDate !== undefined) {
    updateFields.push('achieved_date = ?')
    updateValues.push(input.achievedDate)
  }

  if (input.order !== undefined) {
    updateFields.push('"order" = ?')
    updateValues.push(input.order)
  }

  if (updateFields.length === 0) {
    try {
      const result = await db.select<DbRoadmapTask[]>(
        `SELECT id, title, project_id, section_id, target_year, target_month,
                completed, achieved_date, "order", created_at, updated_at
         FROM roadmap_tasks WHERE id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Roadmap task not found')
      }
      return mapDbToTask(result[0])
    } catch (err) {
      handleDbError(err, 'get roadmap task')
    }
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE roadmap_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbRoadmapTask[]>(
      `SELECT id, title, project_id, section_id, target_year, target_month,
              completed, achieved_date, "order", created_at, updated_at
       FROM roadmap_tasks WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update roadmap task: record not found after update')
    }

    return mapDbToTask(result[0])
  } catch (err) {
    handleDbError(err, 'update roadmap task')
  }
}

export async function deleteRoadmapTask(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM roadmap_tasks WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Roadmap task not found')
    }
  } catch (err) {
    handleDbError(err, 'delete roadmap task')
  }
}

export async function updateTaskSection(
  id: number,
  sectionId: number | null,
): Promise<void> {
  const db = await getDatabase()

  try {
    await db.execute(
      'UPDATE roadmap_tasks SET section_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sectionId, id],
    )
  } catch (err) {
    handleDbError(err, 'update roadmap task section')
  }
}

export async function reorderRoadmapTasks(
  updates: { id: number; order: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, order } of updates) {
      await db.execute(
        'UPDATE roadmap_tasks SET "order" = ? WHERE id = ?',
        [order, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder roadmap tasks')
  }
}

export interface RoadmapTaskCounts {
  projectId: number
  incomplete: number
  completed: number
}

export async function getRoadmapTaskCounts(): Promise<RoadmapTaskCounts[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<{
      project_id: number
      incomplete: number
      completed: number
    }[]>(
      `SELECT
        project_id,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as incomplete,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
       FROM roadmap_tasks
       GROUP BY project_id`,
    )

    return result.map((r) => ({
      projectId: r.project_id,
      incomplete: r.incomplete,
      completed: r.completed,
    }))
  } catch (err) {
    handleDbError(err, 'get roadmap task counts')
  }
}
