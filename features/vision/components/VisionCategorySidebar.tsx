'use client'

import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useEditState } from '@/hooks/useEditState'
import { useVisionCategories } from '../hooks/useVisionCategories'
import type { VisionCategory } from '../types/vision-category'
import { VisionCategoryList } from './VisionCategoryList'
import { VisionCategoryCreateForm } from './VisionCategoryCreateForm'

interface VisionCategorySidebarProps {
  selectedCategoryId: number | 'all' | null
  onSelectCategory: (categoryId: number | 'all' | null) => void
}

export function VisionCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
}: VisionCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createVisionCategory,
    updateVisionCategory,
    deleteVisionCategory,
  } = useVisionCategories()
  const editState = useEditState()
  const { operationError, execute } = useAsyncOperation()

  const handleCreateCategory = async (name: string) => {
    const newCategory = await execute(
      () => createVisionCategory({ name }),
      'カテゴリーの作成に失敗しました',
    )
    if (newCategory !== undefined) {
      onSelectCategory(newCategory.id)
    }
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    const result = await execute(
      () => updateVisionCategory(id, { name }),
      'カテゴリーの更新に失敗しました',
    )
    if (result !== undefined) {
      editState.cancelEdit()
    }
  }

  const handleDeleteCategory = async (category: VisionCategory) => {
    const result = await execute(
      () => deleteVisionCategory(category.id),
      'カテゴリーの削除に失敗しました',
    )
    if (result !== undefined && selectedCategoryId === category.id) {
      onSelectCategory('all')
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
        <h2 className="mb-4 text-lg font-semibold">ビジョン</h2>

        <ErrorMessage message={error || operationError || ''} />

        <VisionCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          editState={editState}
          onSelectCategory={onSelectCategory}
          onDelete={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
        />
      </div>

      <div className="border-t border-stone-700/60 p-4">
        <VisionCategoryCreateForm onSubmit={handleCreateCategory} />
      </div>
    </div>
  )
}
