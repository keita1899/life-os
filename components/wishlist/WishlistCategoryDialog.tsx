'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { WishlistCategoryForm } from './WishlistCategoryForm'
import type {
  WishlistCategory,
  CreateWishlistCategoryInput,
} from '@/lib/types/wishlist-category'

interface WishlistCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateWishlistCategoryInput) => Promise<void>
  category?: WishlistCategory
}

export const WishlistCategoryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  category,
}: WishlistCategoryDialogProps) => {
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
      formComponent={WishlistCategoryForm}
    />
  )
}
