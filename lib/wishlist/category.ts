import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  WishlistCategory,
  CreateWishlistCategoryInput,
  UpdateWishlistCategoryInput,
} from '../types/wishlist-category'

interface DbWishlistCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
}

function mapDbWishlistCategoryToWishlistCategory(
  dbCategory: DbWishlistCategory,
): WishlistCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

export async function getAllWishlistCategories(): Promise<WishlistCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbWishlistCategory[]>(
      `SELECT ${DB_COLUMNS.WISHLIST_CATEGORIES.join(', ')} FROM wishlist_categories
       ORDER BY name ASC`,
    )

    return result.map(mapDbWishlistCategoryToWishlistCategory)
  } catch (err) {
    handleDbError(err, 'get wishlist categories')
  }
}

export async function createWishlistCategory(
  input: CreateWishlistCategoryInput,
): Promise<WishlistCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO wishlist_categories (name)
       VALUES (?)`,
      [input.name],
    )

    const result = await db.select<DbWishlistCategory[]>(
      `SELECT ${DB_COLUMNS.WISHLIST_CATEGORIES.join(', ')} FROM wishlist_categories
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create wishlist category: record not found after insert')
    }

    return mapDbWishlistCategoryToWishlistCategory(result[0])
  } catch (err) {
    handleDbError(err, 'create wishlist category')
  }
}

export async function updateWishlistCategory(
  id: number,
  input: UpdateWishlistCategoryInput,
): Promise<WishlistCategory> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbWishlistCategory[]>(
      `SELECT ${DB_COLUMNS.WISHLIST_CATEGORIES.join(', ')} FROM wishlist_categories
       WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Wishlist category not found')
    }
    return mapDbWishlistCategoryToWishlistCategory(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE wishlist_categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbWishlistCategory[]>(
      `SELECT ${DB_COLUMNS.WISHLIST_CATEGORIES.join(', ')} FROM wishlist_categories
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update wishlist category: record not found after update')
    }

    return mapDbWishlistCategoryToWishlistCategory(result[0])
  } catch (err) {
    handleDbError(err, 'update wishlist category')
  }
}

export async function deleteWishlistCategory(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM wishlist_categories WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Wishlist category not found')
    }
  } catch (err) {
    handleDbError(err, 'delete wishlist category')
  }
}
