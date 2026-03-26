import { useEffect, useRef } from 'react'
import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
  reorderSubscriptions,
} from '../lib'
import {
  getExpiredActiveSubscriptions,
  advanceBillingDate,
} from '../lib/utils'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../types/subscription'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useSubscriptions() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Subscription[]>(SWR_KEYS.subscriptions, () =>
    getAllSubscriptions(),
  )
  const hasAutoRenewed = useRef(false)

  useEffect(() => {
    if (isLoading || hasAutoRenewed.current || data.length === 0) return
    hasAutoRenewed.current = true

    const expired = getExpiredActiveSubscriptions(data)
    if (expired.length === 0) return

    void (async () => {
      for (const sub of expired) {
        const nextDate = advanceBillingDate(sub.nextBillingDate, sub.billingCycle)
        if (nextDate) {
          await updateSubscription(sub.id, { nextBillingDate: nextDate })
        }
      }
      await mutate(SWR_KEYS.subscriptions)
    })()
  }, [data, isLoading])

  const handleCreateSubscription = async (input: CreateSubscriptionInput) => {
    const result = await createSubscription(input)
    await mutate(SWR_KEYS.subscriptions)
    return result
  }

  const handleUpdateSubscription = async (
    id: number,
    input: UpdateSubscriptionInput,
  ) => {
    const result = await updateSubscription(id, input)
    await mutate(SWR_KEYS.subscriptions)
    return result
  }

  const handleDeleteSubscription = async (id: number): Promise<true> => {
    await deleteSubscription(id)
    await mutate(SWR_KEYS.subscriptions)
    return true
  }

  const handleToggleSubscriptionActive = async (
    id: number,
    active: boolean,
  ) => {
    await updateSubscription(id, { active })
    await mutate(SWR_KEYS.subscriptions)
  }

  const handleReorderSubscriptions = async (
    updates: { id: number; order: number }[],
  ) => {
    await reorderSubscriptions(updates)
    await mutate(SWR_KEYS.subscriptions)
  }

  return {
    subscriptions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch subscriptions'
      : null,
    createSubscription: handleCreateSubscription,
    updateSubscription: handleUpdateSubscription,
    deleteSubscription: handleDeleteSubscription,
    toggleSubscriptionActive: handleToggleSubscriptionActive,
    reorderSubscriptions: handleReorderSubscriptions,
    refreshSubscriptions: () => mutate(SWR_KEYS.subscriptions),
  }
}
