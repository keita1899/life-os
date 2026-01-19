import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
} from '@/lib/subscriptions'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@/lib/types/subscription'
import { fetcher } from '@/lib/swr'

const subscriptionsKey = 'subscriptions'

export function useSubscriptions() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Subscription[]>(subscriptionsKey, () =>
    fetcher(() => getAllSubscriptions()),
  )

  const handleCreateSubscription = async (input: CreateSubscriptionInput) => {
    await createSubscription(input)
    await mutate(subscriptionsKey)
  }

  const handleUpdateSubscription = async (
    id: number,
    input: UpdateSubscriptionInput,
  ) => {
    await updateSubscription(id, input)
    await mutate(subscriptionsKey)
  }

  const handleDeleteSubscription = async (id: number) => {
    await deleteSubscription(id)
    await mutate(subscriptionsKey)
  }

  const handleToggleSubscriptionActive = async (
    id: number,
    active: boolean,
  ) => {
    await updateSubscription(id, { active })
    await mutate(subscriptionsKey)
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
    refreshSubscriptions: () => mutate(subscriptionsKey),
  }
}
