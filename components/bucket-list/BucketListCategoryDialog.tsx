'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { BucketListCategoryForm } from './BucketListCategoryForm'
import type {
  BucketListCategory,
  CreateBucketListCategoryInput,
} from '@/lib/types/bucket-list-category'

interface BucketListCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateBucketListCategoryInput) => Promise<void>
  category?: BucketListCategory
}

export const BucketListCategoryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  category,
}: BucketListCategoryDialogProps) => {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={category}
      title={{
        create: '新しいカテゴリーを作成',
        edit: 'カテゴリーを編集',
      }}
      formComponent={BucketListCategoryForm}
    />
  )
}
