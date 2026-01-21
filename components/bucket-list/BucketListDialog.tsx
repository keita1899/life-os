'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { BucketListItemForm } from './BucketListItemForm'
import type { BucketListItem, CreateBucketListItemInput } from '@/lib/types/bucket-list-item'

interface BucketListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateBucketListItemInput) => Promise<void>
  item?: BucketListItem
}

export const BucketListDialog = ({
  open,
  onOpenChange,
  onSubmit,
  item,
}: BucketListDialogProps) => {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={item}
      title={{
        create: '新しいやりたいことを作成',
        edit: 'やりたいことを編集',
      }}
      formComponent={BucketListItemForm}
    />
  )
}
