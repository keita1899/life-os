import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import type {
  InterviewItem,
  CreateInterviewItemInput,
  UpdateInterviewItemInput,
} from '../types/interview-item'
import type { InterviewCategory } from '../types/interview-category'

interface DbInterviewItem {
  id: number
  question: string
  answer: string | null
  category_id: number | null
  order: number
  created_at: string
  updated_at: string
}

interface DbInterviewItemWithCategory extends DbInterviewItem {
  category_id_from_join: number | null
  category_name: string | null
  category_created_at: string | null
  category_updated_at: string | null
}

function mapToItem(db: DbInterviewItemWithCategory): InterviewItem {
  const category: InterviewCategory | null =
    db.category_id_from_join && db.category_name && db.category_created_at && db.category_updated_at
      ? {
          id: db.category_id_from_join,
          name: db.category_name,
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
    ii.id,
    ii.question,
    ii.answer,
    ii.category_id,
    ii."order",
    ii.created_at,
    ii.updated_at,
    ic.id as category_id_from_join,
    ic.name as category_name,
    ic.created_at as category_created_at,
    ic.updated_at as category_updated_at
  FROM interview_items ii
  LEFT JOIN interview_categories ic ON ii.category_id = ic.id
`

async function getMaxOrder(categoryId: number | null): Promise<number> {
  const db = await getDatabase()
  try {
    const result = await db.select<{ max_order: number | null }[]>(
      `SELECT MAX("order") as max_order FROM interview_items WHERE category_id ${
        categoryId === null ? 'IS NULL' : '= ?'
      }`,
      categoryId === null ? [] : [categoryId],
    )
    return result[0]?.max_order ?? -1
  } catch (err) {
    handleDbError(err, 'get max order')
  }
}

export async function getAllInterviewItems(): Promise<InterviewItem[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbInterviewItemWithCategory[]>(
      `${SELECT_WITH_CATEGORY} ORDER BY ii."order" ASC, ii.created_at ASC`,
    )
    return result.map(mapToItem)
  } catch (err) {
    handleDbError(err, 'get interview items')
  }
}

export async function createInterviewItem(
  input: CreateInterviewItemInput,
): Promise<InterviewItem> {
  const db = await getDatabase()
  const maxOrder = await getMaxOrder(input.categoryId ?? null)
  const newOrder = maxOrder + 1

  try {
    const insertResult = await db.execute(
      `INSERT INTO interview_items (question, answer, category_id, "order")
       VALUES (?, ?, ?, ?)`,
      [input.question, input.answer ?? null, input.categoryId ?? null, newOrder],
    )

    let insertedId: number | undefined
    if (
      insertResult &&
      typeof insertResult === 'object' &&
      'lastInsertId' in insertResult
    ) {
      insertedId = (insertResult as { lastInsertId: number }).lastInsertId
    }
    if (!insertedId) {
      const fallback = await db.select<{ last_insert_rowid: number }[]>(
        'SELECT last_insert_rowid() as last_insert_rowid',
      )
      insertedId = fallback[0]?.last_insert_rowid
    }
    if (!insertedId) {
      throw new Error('Failed to get inserted interview item id')
    }

    const result = await db.select<DbInterviewItemWithCategory[]>(
      `${SELECT_WITH_CATEGORY} WHERE ii.id = ?`,
      [insertedId],
    )
    if (result.length === 0) {
      throw new Error('Failed to create interview item: record not found after insert')
    }
    return mapToItem(result[0])
  } catch (err) {
    handleDbError(err, 'create interview item')
  }
}

const UPDATE_MAPPING: FieldMapping<UpdateInterviewItemInput> = [
  { key: 'question', column: 'question' },
  { key: 'answer', column: 'answer' },
  { key: 'categoryId', column: 'category_id', transform: (v) => v ?? null },
  { key: 'order', column: '"order"' },
]

export async function updateInterviewItem(
  id: number,
  input: UpdateInterviewItemInput,
): Promise<InterviewItem> {
  const db = await getDatabase()
  const params = buildUpdateParams(input, UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbInterviewItemWithCategory[]>(
        `${SELECT_WITH_CATEGORY} WHERE ii.id = ?`,
        [id],
      )
      if (result.length === 0) throw new Error('Interview item not found')
      return mapToItem(result[0])
    } catch (err) {
      handleDbError(err, 'update interview item')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE interview_items SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbInterviewItemWithCategory[]>(
      `${SELECT_WITH_CATEGORY} WHERE ii.id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Failed to update interview item: record not found after update')
    }
    return mapToItem(result[0])
  } catch (err) {
    handleDbError(err, 'update interview item')
  }
}

export async function deleteInterviewItem(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM interview_items WHERE id = ?',
      [id],
    )
    if (result.rowsAffected === 0) {
      throw new Error('Interview item not found')
    }
  } catch (err) {
    handleDbError(err, 'delete interview item')
  }
}
