'use client'

import { useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useWishlistCategories } from '@/hooks/useWishlistCategories'
import type { WishlistCategory } from '@/lib/types/wishlist-category'
import { WishlistCategoryList } from './WishlistCategoryList'
import { WishlistCategoryCreateForm } from './WishlistCategoryCreateForm'

interface WishlistCategorySidebarProps {
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
}

export function WishlistCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
}: WishlistCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createWishlistCategory,
    updateWishlistCategory,
    deleteWishlistCategory,
  } = useWishlistCategories()
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  )
  const [operationError, setOperationError] = useState<string | null>(null)

  const handleCreateCategory = async (name: string) => {
    try {
      setOperationError(null)
      const newCategory = await createWishlistCategory({ name })
      onSelectCategory(newCategory.id.toString())
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      )
      throw err
    }
  }

  const handleStartEdit = (category: WishlistCategory) => {
    setEditingCategoryId(category.id)
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    try {
      setOperationError(null)
      await updateWishlistCategory(id, { name })
      setEditingCategoryId(null)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの更新に失敗しました',
      )
      throw err
    }
  }

  const handleDeleteCategory = async (category: WishlistCategory) => {
    try {
      setOperationError(null)
      await deleteWishlistCategory(category.id)
      if (selectedCategoryId === category.id.toString()) {
        onSelectCategory('all')
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの削除に失敗しました',
      )
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="w-64 border-r border-stone-200/60 bg-stone-900/10 p-4 text-foreground dark:border-stone-700/40 dark:bg-stone-900/20">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-stone-200/60 bg-stone-900/10 text-foreground dark:border-stone-700/40 dark:bg-stone-900/20">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-lg font-semibold">欲しいものリスト</h2>

        <ErrorMessage message={error || operationError || ''} />

        <WishlistCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          editingCategoryId={editingCategoryId}
          onSelectCategory={onSelectCategory}
          onStartEdit={handleStartEdit}
          onDelete={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div className="border-t border-stone-700/60 p-4">
        <WishlistCategoryCreateForm onSubmit={handleCreateCategory} />
      </div>
    </div>
  )
}
