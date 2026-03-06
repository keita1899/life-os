import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import type {
  TopicItem,
  CreateTopicItemInput,
  UpdateTopicItemInput,
} from '../types/topic-item'
import type { TopicCategory } from '../types/topic-category'

function hasLastInsertId(value: unknown): value is { lastInsertId: number } {
  return (
    value != null &&
    typeof value === 'object' &&
    'lastInsertId' in value &&
    typeof (value as Record<string, unknown>).lastInsertId === 'number'
  )
}

interface DbTopicItem {
  id: number
  question: string
  answer: string | null
  category_id: number | null
  order: number
  created_at: string
  updated_at: string
}

interface DbTopicItemWithCategory extends DbTopicItem {
  category_id_from_join: number | null
  category_name: string | null
  category_created_at: string | null
  category_updated_at: string | null
}

function mapToItem(db: DbTopicItemWithCategory): TopicItem {
  const category: TopicCategory | null =
    db.category_id_from_join && db.category_name && db.category_created_at && db.category_updated_at
      ? {
          id: db.category_id_from_join,
          name: db.category_name,
          sortOrder: 0,
          createdAt: db.category_created_at,
          updatedAt: db.category_updated_at,
        }
      : null

  return {
    id: db.id,
    question: db.question,
    answer: db.answer,
    categoryId: db.category_id,
    category,
    order: db.order,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

const SELECT_WITH_CATEGORY = `
  SELECT
    ti.id,
    ti.question,
    ti.answer,
    ti.category_id,
    ti."order",
    ti.created_at,
    ti.updated_at,
    tc.id as category_id_from_join,
    tc.name as category_name,
    tc.created_at as category_created_at,
    tc.updated_at as category_updated_at
  FROM topic_items ti
  LEFT JOIN topic_categories tc ON ti.category_id = tc.id
`

async function getMaxOrder(categoryId: number | null): Promise<number> {
  const db = await getDatabase()
  try {
    const result = await db.select<{ max_order: number | null }[]>(
      `SELECT MAX("order") as max_order FROM topic_items WHERE category_id ${
        categoryId === null ? 'IS NULL' : '= ?'
      }`,
      categoryId === null ? [] : [categoryId],
    )
    return result[0]?.max_order ?? -1
  } catch (err) {
    handleDbError(err, 'get max order')
  }
}

export async function getAllTopicItems(): Promise<TopicItem[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTopicItemWithCategory[]>(
      `${SELECT_WITH_CATEGORY} ORDER BY ti."order" ASC, ti.created_at ASC`,
    )
    return result.map(mapToItem)
  } catch (err) {
    handleDbError(err, 'get topic items')
  }
}

export async function createTopicItem(
  input: CreateTopicItemInput,
): Promise<TopicItem> {
  const db = await getDatabase()
  const maxOrder = await getMaxOrder(input.categoryId ?? null)
  const newOrder = maxOrder + 1

  try {
    const insertResult = await db.execute(
      `INSERT INTO topic_items (question, answer, category_id, "order")
       VALUES (?, ?, ?, ?)`,
      [input.question, input.answer ?? null, input.categoryId ?? null, newOrder],
    )

    let insertedId: number | undefined
    if (hasLastInsertId(insertResult)) {
      insertedId = insertResult.lastInsertId
    }
    if (insertedId == null) {
      const fallback = await db.select<{ last_insert_rowid: number }[]>(
        'SELECT last_insert_rowid() as last_insert_rowid',
      )
      insertedId = fallback[0]?.last_insert_rowid
    }
    if (insertedId == null) {
      throw new Error('Failed to get inserted topic item id')
    }

    const result = await db.select<DbTopicItemWithCategory[]>(
      `${SELECT_WITH_CATEGORY} WHERE ti.id = ?`,
      [insertedId],
    )
    if (result.length === 0) {
      throw new Error('Failed to create topic item: record not found after insert')
    }
    return mapToItem(result[0])
  } catch (err) {
    handleDbError(err, 'create topic item')
  }
}

const UPDATE_MAPPING: FieldMapping<UpdateTopicItemInput> = [
  { key: 'question', column: 'question' },
  { key: 'answer', column: 'answer' },
  { key: 'categoryId', column: 'category_id', transform: (v) => v ?? null },
  { key: 'order', column: '"order"' },
]

export async function updateTopicItem(
  id: number,
  input: UpdateTopicItemInput,
): Promise<TopicItem> {
  const db = await getDatabase()
  const params = buildUpdateParams(input, UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbTopicItemWithCategory[]>(
        `${SELECT_WITH_CATEGORY} WHERE ti.id = ?`,
        [id],
      )
      if (result.length === 0) throw new Error('Topic item not found')
      return mapToItem(result[0])
    } catch (err) {
      handleDbError(err, 'update topic item')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE topic_items SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbTopicItemWithCategory[]>(
      `${SELECT_WITH_CATEGORY} WHERE ti.id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Failed to update topic item: record not found after update')
    }
    return mapToItem(result[0])
  } catch (err) {
    handleDbError(err, 'update topic item')
  }
}

export async function deleteTopicItem(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM topic_items WHERE id = ?',
      [id],
    )
    if (result.rowsAffected === 0) {
      throw new Error('Topic item not found')
    }
  } catch (err) {
    handleDbError(err, 'delete topic item')
  }
}

export async function reorderTopicItems(
  updates: { id: number; order: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, order } of updates) {
      await db.execute(
        'UPDATE topic_items SET "order" = ? WHERE id = ?',
        [order, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder topic items')
  }
}
