'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil, Plus } from 'lucide-react'
import { WishlistCategoryDialog } from './WishlistCategoryDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useWishlistCategories } from '@/hooks/useWishlistCategories'
import type {
  WishlistCategory,
  CreateWishlistCategoryInput,
  UpdateWishlistCategoryInput,
} from '@/lib/types/wishlist-category'

export function WishlistCategoryManagement() {
  const {
    categories,
    isLoading,
    error,
    createWishlistCategory,
    updateWishlistCategory,
    deleteWishlistCategory,
  } = useWishlistCategories()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<
    WishlistCategory | undefined
  >(undefined)
  const [deletingCategory, setDeletingCategory] = useState<
    WishlistCategory | undefined
  >(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)

  const handleCreateCategory = async (input: CreateWishlistCategoryInput) => {
    try {
      setOperationError(null)
      await createWishlistCategory(input)
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      )
    }
  }

  const handleUpdateCategory = async (input: CreateWishlistCategoryInput) => {
    if (!editingCategory) return

    try {
      setOperationError(null)
      const updateInput: UpdateWishlistCategoryInput = {
        name: input.name,
      }
      await updateWishlistCategory(editingCategory.id, updateInput)
      setIsDialogOpen(false)
      setEditingCategory(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの更新に失敗しました',
      )
    }
  }

  const handleEditCategory = (category: WishlistCategory) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingCategory(undefined)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    try {
      setOperationError(null)
      await deleteWishlistCategory(deletingCategory.id)
      setDeletingCategory(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (category: WishlistCategory) => {
    setDeletingCategory(category)
  }

  const handleAddClick = () => {
    setEditingCategory(undefined)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          カテゴリーを追加
        </Button>
      </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
          <p className="text-muted-foreground">カテゴリーがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <span className="font-medium">{category.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditCategory(category)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">編集</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(category)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">削除</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WishlistCategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
      />

      <DeleteConfirmDialog
        open={!!deletingCategory}
        message={`「${deletingCategory?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCategory(undefined)}
      />
    </div>
  )
}
