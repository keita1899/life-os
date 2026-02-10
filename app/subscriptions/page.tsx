'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  SubscriptionList,
  SubscriptionDialog,
  useSubscriptions,
  calculateMonthlyTotal,
  getUpcomingBillingSubscriptions,
  type CreateSubscriptionInput,
  type Subscription,
  type UpdateSubscriptionInput,
} from '@/features/subscriptions'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { format } from 'date-fns'

export default function SubscriptionsPage() {
  const {
    subscriptions,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
  } = useSubscriptions()
  const {
    isDialogOpen,
    editingItem: editingSubscription,
    handleEdit: handleEditSubscription,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<Subscription>()
  const deleteConfirm = useDeleteConfirm<Subscription>()
  const { operationError, setOperationError, execute } = useAsyncOperation()

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

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

  const handleCreateSubscription = async (input: CreateSubscriptionInput) => {
    const result = await execute(
      () => createSubscription(input),
      'サブスクの作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleUpdateSubscription = async (input: CreateSubscriptionInput) => {
    if (!editingSubscription) return

    const updateInput: UpdateSubscriptionInput = {
      name: input.name,
      monthlyPrice: input.monthlyPrice,
      billingCycle: input.billingCycle,
      nextBillingDate: input.nextBillingDate,
      startDate: input.startDate,
      cancellationUrl: input.cancellationUrl,
      active: input.active,
    }
    const result = await execute(
      () => updateSubscription(editingSubscription.id, updateInput),
      'サブスクの更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteSubscription = async () => {
    const subscription = deleteConfirm.deletingItem
    if (!subscription) return

    const result = await execute(
      () => deleteSubscription(subscription.id),
      'サブスクの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleActive = async (subscription: Subscription) => {
    await execute(
      () => toggleSubscriptionActive(subscription.id, !subscription.active),
      'サブスクの契約状態の更新に失敗しました',
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">サブスク</h1>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              サブスクを作成
            </Button>
          </div>
        </div>

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
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={['active']}
        >
          {groupedSubscriptions.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionHeader className="flex items-center justify-between">
                <AccordionTrigger className="hover:no-underline flex-1">
                  <div className="flex w-full items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {group.title}
                    </h2>
                    {group.subscriptions.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {group.subscriptions.length}
                      </span>
                    )}
                    {group.key === 'active' && monthlyTotal > 0 && (
                      <span className="ml-auto text-lg text-muted-foreground">
                        月額合計:{' '}
                        <span className="font-semibold text-foreground tabular-nums">
                          {monthlyTotal.toLocaleString()}円
                        </span>
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <SubscriptionList
                  subscriptions={group.subscriptions}
                  onEdit={handleEditSubscription}
                  onDelete={deleteConfirm.handleDeleteClick}
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
        open={!!deleteConfirm.deletingItem}
        message={`「${deleteConfirm.deletingItem?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteSubscription}
        onCancel={deleteConfirm.handleDeleteCancel}
      />
      </div>
    </>
  )
}
