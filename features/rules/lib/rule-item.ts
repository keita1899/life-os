import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import type {
  RuleItem,
  CreateRuleItemInput,
  UpdateRuleItemInput,
} from '../types/rule-item'
import type { RuleCategory } from '../types/rule-category'

interface DbRuleItem {
  id: number
  title: string
  category_id: number | null
  order: number
  created_at: string
  updated_at: string
}

interface DbRuleItemWithCategory extends DbRuleItem {
  category_id_from_join: number | null
  category_name: string | null
  category_created_at: string | null
  category_updated_at: string | null
}

function mapDbRuleItemToRuleItem(
  dbItem: DbRuleItemWithCategory,
): RuleItem {
  const category: RuleCategory | null =
    dbItem.category_id_from_join && dbItem.category_name
      ? {
          id: dbItem.category_id_from_join,
          name: dbItem.category_name,
          createdAt: dbItem.category_created_at!,
          updatedAt: dbItem.category_updated_at!,
        }
      : null

  return {
    id: dbItem.id,
    title: dbItem.title,
    categoryId: dbItem.category_id,
    category,
    order: dbItem.order,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
  }
}

async function getMaxOrder(categoryId: number | null): Promise<number> {
  const db = await getDatabase()
  try {
    const result = await db.select<{ max_order: number | null }[]>(
      `SELECT MAX("order") as max_order FROM rule_items WHERE category_id ${
        categoryId === null ? 'IS NULL' : '= ?'
      }`,
      categoryId === null ? [] : [categoryId],
    )
    return result[0]?.max_order ?? -1
  } catch (err) {
    handleDbError(err, 'get max order')
  }
}

export async function getAllRuleItems(): Promise<RuleItem[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbRuleItemWithCategory[]>(
      `SELECT
        ri.id,
        ri.title,
        ri.category_id,
        ri."order",
        ri.created_at,
        ri.updated_at,
        rc.id as category_id_from_join,
        rc.name as category_name,
        rc.created_at as category_created_at,
        rc.updated_at as category_updated_at
      FROM rule_items ri
      LEFT JOIN rule_categories rc ON ri.category_id = rc.id
      ORDER BY ri."order" ASC, ri.created_at ASC`,
    )

    return result.map(mapDbRuleItemToRuleItem)
  } catch (err) {
    handleDbError(err, 'get rule items')
  }
}

export async function createRuleItem(
  input: CreateRuleItemInput,
): Promise<RuleItem> {
  const db = await getDatabase()

  const maxOrder = await getMaxOrder(input.categoryId || null)
  const newOrder = maxOrder + 1

  try {
    const insertResult = await db.execute(
      `INSERT INTO rule_items (title, category_id, "order")
       VALUES (?, ?, ?)`,
      [input.title, input.categoryId || null, newOrder],
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
      const lastInsertIdResult = await db.select<
        { last_insert_rowid: number }[]
      >('SELECT last_insert_rowid() as last_insert_rowid')
      insertedId = lastInsertIdResult[0]?.last_insert_rowid
    }

    if (!insertedId) {
      throw new Error('Failed to get inserted rule item id')
    }

    const result = await db.select<DbRuleItemWithCategory[]>(
      `SELECT
        ri.id,
        ri.title,
        ri.category_id,
        ri."order",
        ri.created_at,
        ri.updated_at,
        rc.id as category_id_from_join,
        rc.name as category_name,
        rc.created_at as category_created_at,
        rc.updated_at as category_updated_at
      FROM rule_items ri
      LEFT JOIN rule_categories rc ON ri.category_id = rc.id
      WHERE ri.id = ?`,
      [insertedId],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create rule item: record not found after insert',
      )
    }

    return mapDbRuleItemToRuleItem(result[0])
  } catch (err) {
    handleDbError(err, 'create rule item')
  }
}

const RULE_ITEM_UPDATE_MAPPING: FieldMapping<UpdateRuleItemInput> = [
  { key: 'title', column: 'title' },
  { key: 'categoryId', column: 'category_id', transform: (v) => v || null },
  { key: 'order', column: '"order"' },
]

export async function updateRuleItem(
  id: number,
  input: UpdateRuleItemInput,
): Promise<RuleItem> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, RULE_ITEM_UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbRuleItemWithCategory[]>(
        `SELECT
          ri.id,
          ri.title,
          ri.category_id,
          ri."order",
          ri.created_at,
          ri.updated_at,
          rc.id as category_id_from_join,
          rc.name as category_name,
          rc.created_at as category_created_at,
          rc.updated_at as category_updated_at
        FROM rule_items ri
        LEFT JOIN rule_categories rc ON ri.category_id = rc.id
        WHERE ri.id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Rule item not found')
      }
      return mapDbRuleItemToRuleItem(result[0])
    } catch (err) {
      handleDbError(err, 'update rule item')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE rule_items SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbRuleItemWithCategory[]>(
      `SELECT
        ri.id,
        ri.title,
        ri.category_id,
        ri."order",
        ri.created_at,
        ri.updated_at,
        rc.id as category_id_from_join,
        rc.name as category_name,
        rc.created_at as category_created_at,
        rc.updated_at as category_updated_at
      FROM rule_items ri
      LEFT JOIN rule_categories rc ON ri.category_id = rc.id
      WHERE ri.id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update rule item: record not found after update')
    }

    return mapDbRuleItemToRuleItem(result[0])
  } catch (err) {
    handleDbError(err, 'update rule item')
  }
}

export async function deleteRuleItem(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM rule_items WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Rule item not found')
    }
  } catch (err) {
    handleDbError(err, 'delete rule item')
  }
}
