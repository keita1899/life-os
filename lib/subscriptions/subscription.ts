import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../types/subscription'

interface DbSubscription {
  id: number
  name: string
  monthly_price: number
  billing_cycle: string
  next_billing_date: string
  start_date: string | null
  cancellation_url: string | null
  active: number
  created_at: string
  updated_at: string
}

function isValidBillingCycle(
  value: string,
): value is Subscription['billingCycle'] {
  return ['monthly', 'yearly', 'quarterly', 'other'].includes(value)
}

function mapDbSubscriptionToSubscription(
  dbSubscription: DbSubscription,
): Subscription {
  if (!isValidBillingCycle(dbSubscription.billing_cycle)) {
    throw new Error(
      `Invalid billing cycle: ${dbSubscription.billing_cycle} (subscription id: ${dbSubscription.id})`,
    )
  }

  return {
    id: dbSubscription.id,
    name: dbSubscription.name,
    monthlyPrice: dbSubscription.monthly_price,
    billingCycle: dbSubscription.billing_cycle,
    nextBillingDate: dbSubscription.next_billing_date,
    startDate: dbSubscription.start_date,
    cancellationUrl: dbSubscription.cancellation_url,
    active: dbSubscription.active === 1,
    createdAt: dbSubscription.created_at,
    updatedAt: dbSubscription.updated_at,
  }
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbSubscription[]>(
      `SELECT ${DB_COLUMNS.SUBSCRIPTIONS.join(', ')} FROM subscriptions
       ORDER BY active DESC, next_billing_date ASC`,
    )

    return result.map(mapDbSubscriptionToSubscription)
  } catch (err) {
    handleDbError(err, 'get all subscriptions')
  }
}

export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<Subscription> {
  const db = await getDatabase()

  try {
    const insertResult = await db.execute(
      `INSERT INTO subscriptions (name, monthly_price, billing_cycle, next_billing_date, start_date, cancellation_url, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.monthlyPrice,
        input.billingCycle,
        input.nextBillingDate,
        input.startDate || null,
        input.cancellationUrl || null,
        input.active !== undefined ? (input.active ? 1 : 0) : 1,
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
      throw new Error('Failed to get inserted subscription id')
    }

    const result = await db.select<DbSubscription[]>(
      `SELECT ${DB_COLUMNS.SUBSCRIPTIONS.join(', ')} FROM subscriptions
       WHERE id = ?
       LIMIT 1`,
      [insertedId],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create subscription: record not found after insert',
      )
    }

    return mapDbSubscriptionToSubscription(result[0])
  } catch (err) {
    handleDbError(err, 'create subscription')
  }
}

export async function updateSubscription(
  id: number,
  input: UpdateSubscriptionInput,
): Promise<Subscription> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }

  if (input.monthlyPrice !== undefined) {
    updateFields.push('monthly_price = ?')
    updateValues.push(input.monthlyPrice)
  }

  if (input.billingCycle !== undefined) {
    updateFields.push('billing_cycle = ?')
    updateValues.push(input.billingCycle)
  }

  if (input.nextBillingDate !== undefined) {
    updateFields.push('next_billing_date = ?')
    updateValues.push(input.nextBillingDate)
  }

  if (input.startDate !== undefined) {
    updateFields.push('start_date = ?')
    updateValues.push(input.startDate || null)
  }

  if (input.cancellationUrl !== undefined) {
    updateFields.push('cancellation_url = ?')
    updateValues.push(input.cancellationUrl || null)
  }

  if (input.active !== undefined) {
    updateFields.push('active = ?')
    updateValues.push(input.active ? 1 : 0)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbSubscription[]>(
      `SELECT ${DB_COLUMNS.SUBSCRIPTIONS.join(', ')} FROM subscriptions
       WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Subscription not found')
    }
    return mapDbSubscriptionToSubscription(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE subscriptions SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbSubscription[]>(
      `SELECT ${DB_COLUMNS.SUBSCRIPTIONS.join(', ')} FROM subscriptions
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update subscription: record not found after update')
    }

    return mapDbSubscriptionToSubscription(result[0])
  } catch (err) {
    handleDbError(err, 'update subscription')
  }
}

export async function deleteSubscription(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM subscriptions WHERE id = ?', [id])

    if (result.rowsAffected === 0) {
      throw new Error('Subscription not found')
    }
  } catch (err) {
    handleDbError(err, 'delete subscription')
  }
}
