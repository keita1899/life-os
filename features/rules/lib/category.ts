import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  RuleCategory,
  CreateRuleCategoryInput,
  UpdateRuleCategoryInput,
} from '../types/rule-category'

interface DbRuleCategory {
  id: number
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

function mapDbRuleCategoryToRuleCategory(
  dbCategory: DbRuleCategory,
): RuleCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    sortOrder: dbCategory.sort_order,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const errorStr = String(err).toLowerCase()
  const errorMessage =
    err instanceof Error ? err.message.toLowerCase() : errorStr

  const hasUniqueConstraintFailed =
    errorMessage.includes('unique constraint failed') ||
    (errorMessage.includes('unique constraint') &&
      errorMessage.includes('failed')) ||
    errorStr.includes('unique constraint failed') ||
    (errorStr.includes('unique constraint') && errorStr.includes('failed'))

  const hasSqliteUniqueError =
    err instanceof Error &&
    (err.message.includes('2067') || errorMessage.includes('2067'))

  return hasUniqueConstraintFailed || hasSqliteUniqueError
}

export async function getAllRuleCategories(): Promise<RuleCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbRuleCategory[]>(
      `SELECT ${DB_COLUMNS.RULE_CATEGORIES.join(', ')} FROM rule_categories
       ORDER BY sort_order ASC, id ASC`,
    )

    return result.map(mapDbRuleCategoryToRuleCategory)
  } catch (err) {
    handleDbError(err, 'get rule categories')
  }
}

export async function createRuleCategory(
  input: CreateRuleCategoryInput,
): Promise<RuleCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO rule_categories (name, sort_order)
       VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM rule_categories))`,
      [input.name],
    )

    const result = await db.select<DbRuleCategory[]>(
      `SELECT ${DB_COLUMNS.RULE_CATEGORIES.join(', ')} FROM rule_categories
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create rule category: record not found after insert')
    }

    return mapDbRuleCategoryToRuleCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name}」という名前のカテゴリーは既に存在します`)
    }

    handleDbError(err, 'create rule category')
  }
}

const RULE_CATEGORY_UPDATE_MAPPING: FieldMapping<UpdateRuleCategoryInput> = [
  { key: 'name', column: 'name' },
  { key: 'sortOrder', column: 'sort_order' },
]

export async function updateRuleCategory(
  id: number,
  input: UpdateRuleCategoryInput,
): Promise<RuleCategory> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, RULE_CATEGORY_UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbRuleCategory[]>(
        `SELECT ${DB_COLUMNS.RULE_CATEGORIES.join(', ')} FROM rule_categories
         WHERE id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Rule category not found')
      }
      return mapDbRuleCategoryToRuleCategory(result[0])
    } catch (err) {
      handleDbError(err, 'update rule category')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE rule_categories SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbRuleCategory[]>(
      `SELECT ${DB_COLUMNS.RULE_CATEGORIES.join(', ')} FROM rule_categories
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update rule category: record not found after update')
    }

    return mapDbRuleCategoryToRuleCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const categoryName = input.name || ''
      throw new Error(`「${categoryName}」という名前のカテゴリーは既に存在します`)
    }

    handleDbError(err, 'update rule category')
  }
}

export async function deleteRuleCategory(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM rule_categories WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Rule category not found')
    }
  } catch (err) {
    handleDbError(err, 'delete rule category')
  }
}

export async function reorderRuleCategories(
  updates: { id: number; sortOrder: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, sortOrder } of updates) {
      await db.execute(
        'UPDATE rule_categories SET sort_order = ? WHERE id = ?',
        [sortOrder, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder rule categories')
  }
}
