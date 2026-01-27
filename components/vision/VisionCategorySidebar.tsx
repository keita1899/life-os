'use client'

import { useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useVisionCategories } from '@/hooks/useVisionCategories'
import type { VisionCategory } from '@/lib/types/vision-category'
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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  )
  const [operationError, setOperationError] = useState<string | null>(null)

  const handleCreateCategory = async (name: string) => {
    try {
      setOperationError(null)
      await createVisionCategory({ name })
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      )
      throw err
    }
  }

  const handleStartEdit = (category: VisionCategory) => {
    setEditingCategoryId(category.id)
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    try {
      setOperationError(null)
      await updateVisionCategory(id, { name })
      setEditingCategoryId(null)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの更新に失敗しました',
      )
      throw err
    }
  }

  const handleDeleteCategory = async (category: VisionCategory) => {
    try {
      setOperationError(null)
      await deleteVisionCategory(category.id)
      if (selectedCategoryId === category.id) {
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
        <h2 className="mb-4 text-lg font-semibold">カテゴリー</h2>

        <ErrorMessage message={error || operationError || ''} />

        <VisionCategoryList
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
        <VisionCategoryCreateForm onSubmit={handleCreateCategory} />
      </div>
    </div>
  )
}
