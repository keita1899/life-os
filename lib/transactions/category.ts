import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  TransactionCategory,
  CreateTransactionCategoryInput,
  UpdateTransactionCategoryInput,
} from '../types/transaction-category'

type TransactionCategoryType = 'income' | 'expense'

interface DbTransactionCategory {
  id: number
  type: string
  name: string
  created_at: string
  updated_at: string
}

function mapDbTransactionCategoryToTransactionCategory(
  dbCategory: DbTransactionCategory,
): TransactionCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const errorStr = String(err).toLowerCase()
  const errorMessage =
    err instanceof Error ? err.message.toLowerCase() : errorStr

  return (
    errorMessage.includes('unique') ||
    errorMessage.includes('constraint') ||
    errorStr.includes('unique') ||
    errorStr.includes('constraint') ||
    (err instanceof Error &&
      (err.message.includes('19') || err.message.includes('2067')))
  )
}

export async function getAllTransactionCategories(
  type: TransactionCategoryType,
): Promise<TransactionCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTransactionCategory[]>(
      `SELECT ${DB_COLUMNS.TRANSACTION_CATEGORIES.join(', ')} FROM transaction_categories
       WHERE type = ?
       ORDER BY name ASC`,
      [type],
    )

    return result.map(mapDbTransactionCategoryToTransactionCategory)
  } catch (err) {
    handleDbError(err, `get ${type} categories`)
  }
}

export async function createTransactionCategory(
  type: TransactionCategoryType,
  input: CreateTransactionCategoryInput,
): Promise<TransactionCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO transaction_categories (type, name)
       VALUES (?, ?)`,
      [type, input.name],
    )

    const result = await db.select<DbTransactionCategory[]>(
      `SELECT ${DB_COLUMNS.TRANSACTION_CATEGORIES.join(', ')} FROM transaction_categories
       WHERE type = ? AND name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [type, input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create transaction category: record not found after insert')
    }

    return mapDbTransactionCategoryToTransactionCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const typeLabel = type === 'income' ? '収入' : '支出'
      throw new Error(`「${input.name}」という名前の${typeLabel}カテゴリーは既に存在します`)
    }

    handleDbError(err, `create ${type} category`)
  }
}

export async function updateTransactionCategory(
  type: TransactionCategoryType,
  id: number,
  input: UpdateTransactionCategoryInput,
): Promise<TransactionCategory> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbTransactionCategory[]>(
      `SELECT ${DB_COLUMNS.TRANSACTION_CATEGORIES.join(', ')} FROM transaction_categories
       WHERE id = ? AND type = ?`,
      [id, type],
    )
    if (result.length === 0) {
      throw new Error('Transaction category not found')
    }
    return mapDbTransactionCategoryToTransactionCategory(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id, type)

  try {
    await db.execute(
      `UPDATE transaction_categories SET ${updateFields.join(', ')} WHERE id = ? AND type = ?`,
      updateValues,
    )

    const result = await db.select<DbTransactionCategory[]>(
      `SELECT ${DB_COLUMNS.TRANSACTION_CATEGORIES.join(', ')} FROM transaction_categories
       WHERE id = ? AND type = ?`,
      [id, type],
    )

    if (result.length === 0) {
      throw new Error('Failed to update transaction category: record not found after update')
    }

    return mapDbTransactionCategoryToTransactionCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const categoryName = input.name || ''
      const typeLabel = type === 'income' ? '収入' : '支出'
      throw new Error(`「${categoryName}」という名前の${typeLabel}カテゴリーは既に存在します`)
    }

    handleDbError(err, `update ${type} category`)
  }
}

export async function deleteTransactionCategory(
  type: TransactionCategoryType,
  id: number,
): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      `DELETE FROM transaction_categories WHERE id = ? AND type = ?`,
      [id, type],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Transaction category not found')
    }
  } catch (err) {
    handleDbError(err, `delete ${type} category`)
  }
}
