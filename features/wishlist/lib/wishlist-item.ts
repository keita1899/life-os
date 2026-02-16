import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import type {
  WishlistItem,
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
} from '../types/wishlist-item'
import type { WishlistCategory } from '../types/wishlist-category'

interface DbWishlistItem {
  id: number
  name: string
  category_id: number | null
  target_year: number | null
  target_month: number | null
  price: number | null
  purchased: number
  order: number
  created_at: string
  updated_at: string
}

interface DbWishlistItemWithCategory extends DbWishlistItem {
  category_id_from_join: number | null
  category_name: string | null
  category_created_at: string | null
  category_updated_at: string | null
}

function mapDbWishlistItemToWishlistItem(
  dbItem: DbWishlistItemWithCategory,
): WishlistItem {
  const category: WishlistCategory | null =
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
    name: dbItem.name,
    categoryId: dbItem.category_id,
    category,
    targetYear: dbItem.target_year,
    targetMonth: dbItem.target_month ?? null,
    price: dbItem.price,
    purchased: dbItem.purchased === 1,
    order: dbItem.order,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
  }
}

async function getMaxOrder(): Promise<number> {
  const db = await getDatabase()
  try {
    const result = await db.select<{ max_order: number | null }[]>(
      'SELECT MAX("order") as max_order FROM wishlist_items',
    )
    return result[0]?.max_order ?? -1
  } catch (err) {
    handleDbError(err, 'get max order')
  }
}

export async function getAllWishlistItems(): Promise<WishlistItem[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbWishlistItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.name,
        wi.category_id,
        wi.target_year,
        wi.target_month,
        wi.price,
        wi.purchased,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM wishlist_items wi
      LEFT JOIN wishlist_categories wc ON wi.category_id = wc.id
      ORDER BY wi."order" ASC, wi.created_at ASC`,
    )

    return result.map(mapDbWishlistItemToWishlistItem)
  } catch (err) {
    handleDbError(err, 'get wishlist items')
  }
}

export async function createWishlistItem(
  input: CreateWishlistItemInput,
): Promise<WishlistItem> {
  const db = await getDatabase()

  const maxOrder = await getMaxOrder()
  const newOrder = maxOrder + 1

  try {
    await db.execute(
      `INSERT INTO wishlist_items (name, category_id, target_year, target_month, price, purchased, "order")
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        input.name,
        input.categoryId ?? null,
        input.targetYear ?? null,
        input.targetMonth ?? null,
        input.price ?? null,
        newOrder,
      ],
    )

    const result = await db.select<DbWishlistItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.name,
        wi.category_id,
        wi.target_year,
        wi.target_month,
        wi.price,
        wi.purchased,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM wishlist_items wi
      LEFT JOIN wishlist_categories wc ON wi.category_id = wc.id
      WHERE wi.name = ? AND wi."order" = ?
      ORDER BY wi.created_at DESC, wi.id DESC
      LIMIT 1`,
      [input.name, newOrder],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create wishlist item: record not found after insert',
      )
    }

    return mapDbWishlistItemToWishlistItem(result[0])
  } catch (err) {
    handleDbError(err, 'create wishlist item')
  }
}

const WISHLIST_ITEM_UPDATE_MAPPING: FieldMapping<UpdateWishlistItemInput> = [
  { key: 'name', column: 'name' },
  { key: 'categoryId', column: 'category_id', transform: (v) => v ?? null },
  { key: 'targetYear', column: 'target_year', transform: (v) => v ?? null },
  { key: 'targetMonth', column: 'target_month', transform: (v) => v ?? null },
  { key: 'price', column: 'price', transform: (v) => v ?? null },
  { key: 'purchased', column: 'purchased', transform: (v) => (v ? 1 : 0) },
  { key: 'order', column: '"order"' },
]

export async function updateWishlistItem(
  id: number,
  input: UpdateWishlistItemInput,
): Promise<WishlistItem> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, WISHLIST_ITEM_UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbWishlistItemWithCategory[]>(
        `SELECT 
          wi.id,
          wi.name,
          wi.category_id,
          wi.target_year,
          wi.target_month,
          wi.price,
          wi.purchased,
          wi."order",
          wi.created_at,
          wi.updated_at,
          wc.id as category_id_from_join,
          wc.name as category_name,
          wc.created_at as category_created_at,
          wc.updated_at as category_updated_at
        FROM wishlist_items wi
        LEFT JOIN wishlist_categories wc ON wi.category_id = wc.id
        WHERE wi.id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Wishlist item not found')
      }
      return mapDbWishlistItemToWishlistItem(result[0])
    } catch (err) {
      handleDbError(err, 'get wishlist item')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE wishlist_items SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbWishlistItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.name,
        wi.category_id,
        wi.target_year,
        wi.target_month,
        wi.price,
        wi.purchased,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM wishlist_items wi
      LEFT JOIN wishlist_categories wc ON wi.category_id = wc.id
      WHERE wi.id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to update wishlist item: record not found after update',
      )
    }

    return mapDbWishlistItemToWishlistItem(result[0])
  } catch (err) {
    handleDbError(err, 'update wishlist item')
  }
}

export async function deleteWishlistItem(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM wishlist_items WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Wishlist item not found')
    }
  } catch (err) {
    handleDbError(err, 'delete wishlist item')
  }
}

export async function deleteWishlistItemsByIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return

  const db = await getDatabase()

  try {
    const placeholders = ids.map(() => '?').join(', ')
    await db.execute(
      `DELETE FROM wishlist_items WHERE id IN (${placeholders})`,
      ids,
    )
  } catch (err) {
    handleDbError(err, 'delete wishlist items by ids')
  }
}
