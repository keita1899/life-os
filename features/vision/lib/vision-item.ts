import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import type {
  VisionItem,
  CreateVisionItemInput,
  UpdateVisionItemInput,
} from '../types/vision-item'
import type { VisionCategory } from '../types/vision-category'

interface DbVisionItem {
  id: number
  title: string
  category_id: number | null
  order: number
  created_at: string
  updated_at: string
}

interface DbVisionItemWithCategory extends DbVisionItem {
  category_id_from_join: number | null
  category_name: string | null
  category_created_at: string | null
  category_updated_at: string | null
}

function mapDbVisionItemToVisionItem(
  dbItem: DbVisionItemWithCategory,
): VisionItem {
  const category: VisionCategory | null =
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
      `SELECT MAX("order") as max_order FROM vision_items WHERE category_id ${
        categoryId === null ? 'IS NULL' : '= ?'
      }`,
      categoryId === null ? [] : [categoryId],
    )
    return result[0]?.max_order ?? -1
  } catch (err) {
    handleDbError(err, 'get max order')
  }
}

export async function getAllVisionItems(): Promise<VisionItem[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbVisionItemWithCategory[]>(
      `SELECT 
        vi.id,
        vi.title,
        vi.category_id,
        vi."order",
        vi.created_at,
        vi.updated_at,
        vc.id as category_id_from_join,
        vc.name as category_name,
        vc.created_at as category_created_at,
        vc.updated_at as category_updated_at
      FROM vision_items vi
      LEFT JOIN vision_categories vc ON vi.category_id = vc.id
      ORDER BY vi."order" ASC, vi.created_at ASC`,
    )

    return result.map(mapDbVisionItemToVisionItem)
  } catch (err) {
    handleDbError(err, 'get vision items')
  }
}

export async function createVisionItem(
  input: CreateVisionItemInput,
): Promise<VisionItem> {
  const db = await getDatabase()

  const maxOrder = await getMaxOrder(input.categoryId || null)
  const newOrder = maxOrder + 1

  try {
    const insertResult = await db.execute(
      `INSERT INTO vision_items (title, category_id, "order")
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
      throw new Error('Failed to get inserted vision item id')
    }

    const result = await db.select<DbVisionItemWithCategory[]>(
      `SELECT 
        vi.id,
        vi.title,
        vi.category_id,
        vi."order",
        vi.created_at,
        vi.updated_at,
        vc.id as category_id_from_join,
        vc.name as category_name,
        vc.created_at as category_created_at,
        vc.updated_at as category_updated_at
      FROM vision_items vi
      LEFT JOIN vision_categories vc ON vi.category_id = vc.id
      WHERE vi.id = ?`,
      [insertedId],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create vision item: record not found after insert',
      )
    }

    return mapDbVisionItemToVisionItem(result[0])
  } catch (err) {
    handleDbError(err, 'create vision item')
  }
}

const VISION_ITEM_UPDATE_MAPPING: FieldMapping<UpdateVisionItemInput> = [
  { key: 'title', column: 'title' },
  { key: 'categoryId', column: 'category_id', transform: (v) => v || null },
  { key: 'order', column: '"order"' },
]

export async function updateVisionItem(
  id: number,
  input: UpdateVisionItemInput,
): Promise<VisionItem> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, VISION_ITEM_UPDATE_MAPPING)

  if (params === null) {
    const result = await db.select<DbVisionItemWithCategory[]>(
      `SELECT 
        vi.id,
        vi.title,
        vi.category_id,
        vi."order",
        vi.created_at,
        vi.updated_at,
        vc.id as category_id_from_join,
        vc.name as category_name,
        vc.created_at as category_created_at,
        vc.updated_at as category_updated_at
      FROM vision_items vi
      LEFT JOIN vision_categories vc ON vi.category_id = vc.id
      WHERE vi.id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Vision item not found')
    }
    return mapDbVisionItemToVisionItem(result[0])
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE vision_items SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbVisionItemWithCategory[]>(
      `SELECT 
        vi.id,
        vi.title,
        vi.category_id,
        vi."order",
        vi.created_at,
        vi.updated_at,
        vc.id as category_id_from_join,
        vc.name as category_name,
        vc.created_at as category_created_at,
        vc.updated_at as category_updated_at
      FROM vision_items vi
      LEFT JOIN vision_categories vc ON vi.category_id = vc.id
      WHERE vi.id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update vision item: record not found after update')
    }

    return mapDbVisionItemToVisionItem(result[0])
  } catch (err) {
    handleDbError(err, 'update vision item')
  }
}

export async function deleteVisionItem(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM vision_items WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Vision item not found')
    }
  } catch (err) {
    handleDbError(err, 'delete vision item')
  }
}
