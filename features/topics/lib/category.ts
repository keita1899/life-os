import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  TopicCategory,
  CreateTopicCategoryInput,
  UpdateTopicCategoryInput,
} from '../types/topic-category'

interface DbTopicCategory {
  id: number
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

function mapToCategory(db: DbTopicCategory): TopicCategory {
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
    errorMessage.includes('unique constraint failed') ||
    (errorMessage.includes('unique constraint') &&
      errorMessage.includes('failed')) ||
    errorStr.includes('unique constraint failed') ||
    (err instanceof Error && err.message.includes('2067'))
  )
}

export async function getAllTopicCategories(): Promise<TopicCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTopicCategory[]>(
      `SELECT ${DB_COLUMNS.TOPIC_CATEGORIES.join(', ')} FROM topic_categories
       ORDER BY sort_order ASC, id ASC`,
    )
    return result.map(mapToCategory)
  } catch (err) {
    handleDbError(err, 'get topic categories')
  }
}

export async function createTopicCategory(
  input: CreateTopicCategoryInput,
): Promise<TopicCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO topic_categories (name, sort_order)
       VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM topic_categories))`,
      [input.name],
    )

    const result = await db.select<DbTopicCategory[]>(
      `SELECT ${DB_COLUMNS.TOPIC_CATEGORIES.join(', ')} FROM topic_categories
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create topic category: record not found after insert')
    }

    return mapToCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name}」という名前のカテゴリーは既に存在します`)
    }
    handleDbError(err, 'create topic category')
  }
}

const UPDATE_MAPPING: FieldMapping<UpdateTopicCategoryInput> = [
  { key: 'name', column: 'name' },
  { key: 'sortOrder', column: 'sort_order' },
]

export async function updateTopicCategory(
  id: number,
  input: UpdateTopicCategoryInput,
): Promise<TopicCategory> {
  const db = await getDatabase()
  const params = buildUpdateParams(input, UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbTopicCategory[]>(
        `SELECT ${DB_COLUMNS.TOPIC_CATEGORIES.join(', ')} FROM topic_categories WHERE id = ?`,
        [id],
      )
      if (result.length === 0) throw new Error('Topic category not found')
      return mapToCategory(result[0])
    } catch (err) {
      handleDbError(err, 'update topic category')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE topic_categories SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbTopicCategory[]>(
      `SELECT ${DB_COLUMNS.TOPIC_CATEGORIES.join(', ')} FROM topic_categories WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Failed to update topic category: record not found after update')
    }
    return mapToCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name || ''}」という名前のカテゴリーは既に存在します`)
    }
    handleDbError(err, 'update topic category')
  }
}

export async function deleteTopicCategory(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM topic_categories WHERE id = ?',
      [id],
    )
    if (result.rowsAffected === 0) {
      throw new Error('Topic category not found')
    }
  } catch (err) {
    handleDbError(err, 'delete topic category')
  }
}

export async function reorderTopicCategories(
  updates: { id: number; sortOrder: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, sortOrder } of updates) {
      await db.execute(
        'UPDATE topic_categories SET sort_order = ? WHERE id = ?',
        [sortOrder, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder topic categories')
  }
}
