'use client'

import { useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useBucketListCategories } from '@/hooks/useBucketListCategories'
import type { BucketListCategory } from '@/lib/types/bucket-list-category'
import { BucketListCategoryList } from './BucketListCategoryList'
import { BucketListCategoryCreateForm } from './BucketListCategoryCreateForm'

interface BucketListCategorySidebarProps {
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
}

export function BucketListCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
}: BucketListCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createBucketListCategory,
    updateBucketListCategory,
    deleteBucketListCategory,
  } = useBucketListCategories()
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  )
  const [operationError, setOperationError] = useState<string | null>(null)

  const handleCreateCategory = async (name: string) => {
    try {
      setOperationError(null)
      const newCategory = await createBucketListCategory({ name })
      onSelectCategory(newCategory.id.toString())
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      )
      throw err
    }
  }

  const handleStartEdit = (category: BucketListCategory) => {
    setEditingCategoryId(category.id)
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    try {
      setOperationError(null)
      await updateBucketListCategory(id, { name })
      setEditingCategoryId(null)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの更新に失敗しました',
      )
      throw err
    }
  }

  const handleDeleteCategory = async (category: BucketListCategory) => {
    try {
      setOperationError(null)
      await deleteBucketListCategory(category.id)
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
      <div className="w-64 border-r border-stone-200 bg-muted/40 p-4 dark:border-stone-800">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-stone-200 bg-muted/40 dark:border-stone-800">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-lg font-semibold">やりたいことリスト</h2>

        <ErrorMessage message={error || operationError || ''} />

        <BucketListCategoryList
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

      <div className="border-t border-stone-200 p-4 dark:border-stone-800">
        <BucketListCategoryCreateForm onSubmit={handleCreateCategory} />
      </div>
    </div>
  )
}
