'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { SubscriptionForm } from './SubscriptionForm'
import type {
  Subscription,
  CreateSubscriptionInput,
} from '@/lib/types/subscription'

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateSubscriptionInput) => Promise<void>
  subscription?: Subscription
}

export const SubscriptionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  subscription,
}: SubscriptionDialogProps) => {
  return (
    <FormDialog<CreateSubscriptionInput, Subscription>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={subscription}
      title={{
        create: '新しいサブスクを追加',
        edit: 'サブスクを編集',
      }}
      formComponent={SubscriptionForm}
    />
  )
}
