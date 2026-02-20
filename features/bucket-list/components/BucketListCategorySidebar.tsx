'use client'

import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useBucketListCategories } from '../hooks/useBucketListCategories'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useEditState } from '@/hooks/useEditState'
import type { BucketListCategory } from '../types/bucket-list-category'
import {
  BucketListCategoryList,
  type BucketListCategoryCounts,
} from './BucketListCategoryList'
import { BucketListCategoryCreateForm } from './BucketListCategoryCreateForm'

interface BucketListCategorySidebarProps {
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
  counts?: BucketListCategoryCounts
}

export function BucketListCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
  counts,
}: BucketListCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createBucketListCategory,
    updateBucketListCategory,
    deleteBucketListCategory,
  } = useBucketListCategories()
  const editState = useEditState()
  const { operationError, execute } = useAsyncOperation()

  const handleCreateCategory = async (name: string) => {
    const result = await execute(
      () => createBucketListCategory({ name }),
      'カテゴリーの作成に失敗しました',
    )
    if (result !== undefined) {
      onSelectCategory(result.id.toString())
    }
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    const result = await execute(
      () => updateBucketListCategory(id, { name }),
      'カテゴリーの更新に失敗しました',
    )
    if (result !== undefined) {
      editState.cancelEdit()
    }
  }

  const handleDeleteCategory = async (category: BucketListCategory) => {
    const categoryIdStr = category.id.toString()
    const result = await execute(
      () => deleteBucketListCategory(category.id),
      'カテゴリーの削除に失敗しました',
    )
    if (result !== undefined && selectedCategoryId === categoryIdStr) {
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
        <h2 className="mb-4 text-lg font-semibold">やりたいことリスト</h2>

        <ErrorMessage message={error || operationError || ''} />

        <BucketListCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          editState={editState}
          onSelectCategory={onSelectCategory}
          onDelete={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
          counts={counts}
        />
      </div>

      <div className="border-t border-stone-700/60 p-4">
        <BucketListCategoryCreateForm onSubmit={handleCreateCategory} />
      </div>
    </div>
  )
}
