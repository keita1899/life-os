'use client'

import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useEditState } from '@/hooks/useEditState'
import { useInterviewCategories } from '../hooks/useInterviewCategories'
import type { InterviewCategory } from '../types/interview-category'
import { InterviewCategoryList } from './InterviewCategoryList'
import { InlineCategoryCreateItem } from '@/components/ui/inline-category-create-item'

interface InterviewCategorySidebarProps {
  selectedCategoryId: number | 'all' | 'none' | null
  onSelectCategory: (categoryId: number | 'all' | 'none' | null) => void
}

export function InterviewCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
}: InterviewCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useInterviewCategories()
  const editState = useEditState()
  const { operationError, execute } = useAsyncOperation()

  const handleCreate = async (name: string) => {
    const newCategory = await execute(
      () => createCategory({ name }),
      'カテゴリーの作成に失敗しました',
    )
    if (newCategory !== undefined) {
      onSelectCategory(newCategory.id)
    }
  }

  const handleUpdate = async (id: number, name: string) => {
    const result = await execute(
      () => updateCategory(id, { name }),
      'カテゴリーの更新に失敗しました',
    )
    if (result !== undefined) {
      editState.cancelEdit()
    }
  }

  const handleDelete = async (category: InterviewCategory) => {
    const result = await execute(
      () => deleteCategory(category.id),
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
        <h2 className="mb-4 text-lg font-semibold">面接Q&A</h2>

        <ErrorMessage message={error || operationError || ''} />

        <InterviewCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          editState={editState}
          onSelectCategory={onSelectCategory}
          onDelete={handleDelete}
          onUpdateCategory={handleUpdate}
          onCreateCategory={handleCreate}
        />
      </div>
    </div>
  )
}
