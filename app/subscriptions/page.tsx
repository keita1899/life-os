'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList'
import { SubscriptionDialog } from '@/components/subscriptions/SubscriptionDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useMode } from '@/lib/contexts/ModeContext'
import {
  calculateMonthlyTotal,
  getUpcomingBillingSubscriptions,
} from '@/lib/subscriptions'
import { format } from 'date-fns'
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from '@/lib/types/subscription'

export default function SubscriptionsPage() {
  const { mode } = useMode()
  const {
    subscriptions,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
  } = useSubscriptions()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<
    Subscription | undefined
  >(undefined)
  const [deletingSubscription, setDeletingSubscription] = useState<
    Subscription | undefined
  >(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)

  const groupedSubscriptions = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.active)
    const inactive = subscriptions.filter((sub) => !sub.active)
    return [
      {
        key: 'active',
        title: '契約中',
        subscriptions: active,
      },
      {
        key: 'inactive',
        title: '解約済',
        subscriptions: inactive,
      },
    ]
  }, [subscriptions])

  const monthlyTotal = useMemo(() => {
    return calculateMonthlyTotal(subscriptions)
  }, [subscriptions])

  const upcomingSubscriptions = useMemo(() => {
    return getUpcomingBillingSubscriptions(subscriptions)
  }, [subscriptions])

  if (mode !== 'life') {
    return null
  }

  const handleCreateSubscription = async (input: CreateSubscriptionInput) => {
    try {
      setOperationError(null)
      await createSubscription(input)
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'サブスクの作成に失敗しました',
      )
    }
  }

  const handleUpdateSubscription = async (input: CreateSubscriptionInput) => {
    if (!editingSubscription) return

    try {
      setOperationError(null)
      const updateInput: UpdateSubscriptionInput = {
        name: input.name,
        monthlyPrice: input.monthlyPrice,
        billingCycle: input.billingCycle,
        nextBillingDate: input.nextBillingDate,
        startDate: input.startDate,
        cancellationUrl: input.cancellationUrl,
        active: input.active,
      }
      await updateSubscription(editingSubscription.id, updateInput)
      setIsDialogOpen(false)
      setEditingSubscription(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'サブスクの更新に失敗しました',
      )
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingSubscription(undefined)
    }
  }

  const handleDeleteClick = (subscription: Subscription) => {
    setDeletingSubscription(subscription)
  }

  const handleDeleteSubscription = async () => {
    if (!deletingSubscription) return

    try {
      setOperationError(null)
      await deleteSubscription(deletingSubscription.id)
      setDeletingSubscription(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'サブスクの削除に失敗しました',
      )
    }
  }

  const handleToggleActive = async (subscription: Subscription) => {
    try {
      setOperationError(null)
      await toggleSubscriptionActive(subscription.id, !subscription.active)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'サブスクの契約状態の更新に失敗しました',
      )
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">サブスク管理</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              サブスクを追加
            </Button>
          </div>
        </div>

      {monthlyTotal > 0 && (
        <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <div className="text-sm text-muted-foreground">月額合計</div>
          <div className="text-2xl font-bold">
            {monthlyTotal.toLocaleString()}円
          </div>
        </div>
      )}

      {upcomingSubscriptions.length > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="mb-2 text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            更新日が近いサブスク
          </div>
          <div className="space-y-2">
            {upcomingSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="text-sm text-yellow-700 dark:text-yellow-300"
              >
                {sub.name} - 次回更新:{' '}
                {format(new Date(sub.nextBillingDate), 'yyyy年M月d日')}
              </div>
            ))}
          </div>
        </div>
      )}

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <Accordion type="multiple" className="w-full">
          {groupedSubscriptions.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionHeader className="flex items-center justify-between">
                <AccordionTrigger className="hover:no-underline flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {group.title}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({group.subscriptions.length})
                    </span>
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <SubscriptionList
                  subscriptions={group.subscriptions}
                  onEdit={handleEditSubscription}
                  onDelete={handleDeleteClick}
                  onToggleActive={handleToggleActive}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <SubscriptionDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={
          editingSubscription ? handleUpdateSubscription : handleCreateSubscription
        }
        subscription={editingSubscription}
      />

      <DeleteConfirmDialog
        open={!!deletingSubscription}
        message={`「${deletingSubscription?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteSubscription}
        onCancel={() => setDeletingSubscription(undefined)}
      />
      </div>
    </MainLayout>
  )
}
