import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  InterviewCategory,
  CreateInterviewCategoryInput,
  UpdateInterviewCategoryInput,
} from '../types/interview-category'

interface DbInterviewCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
}

function mapToCategory(db: DbInterviewCategory): InterviewCategory {
  return {
    id: db.id,
    name: db.name,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const errorStr = String(err).toLowerCase()
  const errorMessage =
    err instanceof Error ? err.message.toLowerCase() : errorStr

  return (
    errorMessage.includes('unique constraint failed') ||
    (errorMessage.includes('unique constraint') &&
      errorMessage.includes('failed')) ||
    errorStr.includes('unique constraint failed') ||
    (err instanceof Error && err.message.includes('2067'))
  )
}

export async function getAllInterviewCategories(): Promise<InterviewCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbInterviewCategory[]>(
      `SELECT ${DB_COLUMNS.INTERVIEW_CATEGORIES.join(', ')} FROM interview_categories
       ORDER BY name ASC`,
    )
    return result.map(mapToCategory)
  } catch (err) {
    handleDbError(err, 'get interview categories')
  }
}

export async function createInterviewCategory(
  input: CreateInterviewCategoryInput,
): Promise<InterviewCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO interview_categories (name) VALUES (?)`,
      [input.name],
    )

    const result = await db.select<DbInterviewCategory[]>(
      `SELECT ${DB_COLUMNS.INTERVIEW_CATEGORIES.join(', ')} FROM interview_categories
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create interview category: record not found after insert')
    }

    return mapToCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name}」という名前のカテゴリーは既に存在します`)
    }
    handleDbError(err, 'create interview category')
  }
}

const UPDATE_MAPPING: FieldMapping<UpdateInterviewCategoryInput> = [
  { key: 'name', column: 'name' },
]

export async function updateInterviewCategory(
  id: number,
  input: UpdateInterviewCategoryInput,
): Promise<InterviewCategory> {
  const db = await getDatabase()
  const params = buildUpdateParams(input, UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbInterviewCategory[]>(
        `SELECT ${DB_COLUMNS.INTERVIEW_CATEGORIES.join(', ')} FROM interview_categories WHERE id = ?`,
        [id],
      )
      if (result.length === 0) throw new Error('Interview category not found')
      return mapToCategory(result[0])
    } catch (err) {
      handleDbError(err, 'update interview category')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE interview_categories SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbInterviewCategory[]>(
      `SELECT ${DB_COLUMNS.INTERVIEW_CATEGORIES.join(', ')} FROM interview_categories WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Failed to update interview category: record not found after update')
    }
    return mapToCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name || ''}」という名前のカテゴリーは既に存在します`)
    }
    handleDbError(err, 'update interview category')
  }
}

export async function deleteInterviewCategory(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM interview_categories WHERE id = ?',
      [id],
    )
    if (result.rowsAffected === 0) {
      throw new Error('Interview category not found')
    }
  } catch (err) {
    handleDbError(err, 'delete interview category')
  }
}
