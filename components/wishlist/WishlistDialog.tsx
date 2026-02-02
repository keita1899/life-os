'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { WishlistItemForm } from './WishlistItemForm'
import type { WishlistItem, CreateWishlistItemInput } from '@/lib/types/wishlist-item'

interface WishlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateWishlistItemInput) => Promise<void>
  item?: WishlistItem
  defaultCategoryId?: string
}

export const WishlistDialog = ({
  open,
  onOpenChange,
  onSubmit,
  item,
  defaultCategoryId,
}: WishlistDialogProps) => {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={item}
      title={{
        create: '新しい欲しいものを追加',
        edit: '欲しいものを編集',
      }}
      formComponent={WishlistItemForm}
      formProps={{ defaultCategoryId }}
    />
  )
}
