import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
} from '../lib'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../types/subscription'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useSubscriptions() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Subscription[]>(SWR_KEYS.subscriptions, () =>
    fetcher(() => getAllSubscriptions()),
  )

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
    refreshSubscriptions: () => mutate(SWR_KEYS.subscriptions),
  }
}
