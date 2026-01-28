import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types/transaction'

interface DbTransaction {
  id: number
  date: string
  type: string
  name: string
  amount: number
  category_id: number | null
  is_fixed: number
  created_at: string
  updated_at: string
}

function isValidTransactionType(value: string): value is Transaction['type'] {
  return value === 'income' || value === 'expense'
}

function mapDbTransactionToTransaction(
  dbTransaction: DbTransaction,
): Transaction {
  if (!isValidTransactionType(dbTransaction.type)) {
    throw new Error(
      `Invalid transaction type: ${dbTransaction.type} (transaction id: ${dbTransaction.id})`,
    )
  }

  return {
    id: dbTransaction.id,
    date: dbTransaction.date,
    type: dbTransaction.type,
    name: dbTransaction.name,
    amount: dbTransaction.amount,
    categoryId: dbTransaction.category_id,
    isFixed: dbTransaction.is_fixed === 1,
    createdAt: dbTransaction.created_at,
    updatedAt: dbTransaction.updated_at,
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTransaction[]>(
      `SELECT ${DB_COLUMNS.TRANSACTIONS.join(', ')} FROM transactions
       ORDER BY date DESC, created_at DESC`,
    )

    return result.map(mapDbTransactionToTransaction)
  } catch (err) {
    handleDbError(err, 'get all transactions')
  }
}

export async function getTransactionsByMonth(
  year: number,
  month: number,
): Promise<Transaction[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTransaction[]>(
      `SELECT ${DB_COLUMNS.TRANSACTIONS.join(', ')} FROM transactions
       WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
       ORDER BY date DESC, created_at DESC`,
      [year.toString().padStart(4, '0'), month.toString().padStart(2, '0')],
    )

    return result.map(mapDbTransactionToTransaction)
  } catch (err) {
    handleDbError(err, 'get transactions by month')
  }
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Transaction[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbTransaction[]>(
      `SELECT ${DB_COLUMNS.TRANSACTIONS.join(', ')} FROM transactions
       WHERE date >= ? AND date <= ?
       ORDER BY date DESC, created_at DESC`,
      [startDate, endDate],
    )

    return result.map(mapDbTransactionToTransaction)
  } catch (err) {
    handleDbError(err, 'get transactions by date range')
  }
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const db = await getDatabase()

  try {
    const insertResult = await db.execute(
      `INSERT INTO transactions (date, type, name, amount, category_id, is_fixed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.date,
        input.type,
        input.name,
        input.amount,
        input.categoryId ?? null,
        input.isFixed ? 1 : 0,
      ],
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
      throw new Error('Failed to get inserted transaction id')
    }

    const result = await db.select<DbTransaction[]>(
      `SELECT ${DB_COLUMNS.TRANSACTIONS.join(', ')} FROM transactions
       WHERE id = ?`,
      [insertedId],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create transaction: record not found after insert',
      )
    }

    return mapDbTransactionToTransaction(result[0])
  } catch (err) {
    handleDbError(err, 'create transaction')
  }
}

export async function updateTransaction(
  id: number,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.date !== undefined) {
    updateFields.push('date = ?')
    updateValues.push(input.date)
  }

  if (input.type !== undefined) {
    updateFields.push('type = ?')
    updateValues.push(input.type)
  }

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }

  if (input.amount !== undefined) {
    updateFields.push('amount = ?')
    updateValues.push(input.amount)
  }

  if (input.categoryId !== undefined) {
    updateFields.push('category_id = ?')
    updateValues.push(input.categoryId ?? null)
  }

  if (input.isFixed !== undefined) {
    updateFields.push('is_fixed = ?')
    updateValues.push(input.isFixed ? 1 : 0)
  }

  if (updateFields.length === 0) {
    try {
      const result = await db.select<DbTransaction[]>(
        `SELECT ${DB_COLUMNS.TRANSACTIONS.join(', ')} FROM transactions
         WHERE id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Transaction not found')
      }
      return mapDbTransactionToTransaction(result[0])
    } catch (err) {
      handleDbError(err, 'fetch transaction')
    }
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbTransaction[]>(
      `SELECT ${DB_COLUMNS.TRANSACTIONS.join(', ')} FROM transactions
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update transaction: record not found after update')
    }

    return mapDbTransactionToTransaction(result[0])
  } catch (err) {
    handleDbError(err, 'update transaction')
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM transactions WHERE id = ?', [
      id,
    ])

    if (result.rowsAffected === 0) {
      throw new Error('Transaction not found')
    }
  } catch (err) {
    handleDbError(err, 'delete transaction')
  }
}
