'use client'

import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useEditState } from '@/hooks/useEditState'
import { useWishlistCategories } from '../hooks/useWishlistCategories'
import type { WishlistCategory } from '../types/wishlist-category'
import {
  WishlistCategoryList,
  type WishlistCategoryCounts,
} from './WishlistCategoryList'
import { InlineCategoryCreateItem } from '@/components/ui/inline-category-create-item'

interface WishlistCategorySidebarProps {
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
  counts?: WishlistCategoryCounts
}

export function WishlistCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
  counts,
}: WishlistCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createWishlistCategory,
    updateWishlistCategory,
    deleteWishlistCategory,
  } = useWishlistCategories()
  const editState = useEditState()
  const { operationError, setOperationError, execute } = useAsyncOperation()

  const handleCreateCategory = async (name: string) => {
    const newCategory = await execute(
      () => createWishlistCategory({ name }),
      'カテゴリーの作成に失敗しました',
    )
    if (newCategory !== undefined) {
      onSelectCategory(newCategory.id.toString())
    }
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    const result = await execute(
      () => updateWishlistCategory(id, { name }),
      'カテゴリーの更新に失敗しました',
    )
    if (result !== undefined) {
      editState.cancelEdit()
    }
  }

  const handleDeleteCategory = async (category: WishlistCategory) => {
    const result = await execute(
      () => deleteWishlistCategory(category.id),
      'カテゴリーの削除に失敗しました',
    )
    if (result !== undefined && selectedCategoryId === category.id.toString()) {
      onSelectCategory('all')
    }
  }

  if (isLoading) {
    return (
      <div className="h-full w-64 border-r border-stone-200/60 bg-stone-900/10 p-4 text-foreground dark:border-stone-700/40 dark:bg-stone-900/20">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-stone-200/60 bg-stone-900/10 text-foreground dark:border-stone-700/40 dark:bg-stone-900/20 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-lg font-semibold">欲しいものリスト</h2>

        <ErrorMessage message={error || operationError || ''} />

        <WishlistCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          editState={editState}
          onSelectCategory={onSelectCategory}
          onDelete={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
          counts={counts}
          onCreateCategory={handleCreateCategory}
        />
      </div>
    </div>
  )
}
