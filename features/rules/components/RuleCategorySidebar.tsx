'use client'

import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useEditState } from '@/hooks/useEditState'
import { useRuleCategories } from '../hooks/useRuleCategories'
import type { RuleCategory } from '../types/rule-category'
import { RuleCategoryList } from './RuleCategoryList'

interface RuleCategorySidebarProps {
  selectedCategoryId: number | 'all' | null
  onSelectCategory: (categoryId: number | 'all' | null) => void
}

export function RuleCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
}: RuleCategorySidebarProps) {
  const {
    categories,
    isLoading,
    error,
    createRuleCategory,
    updateRuleCategory,
    deleteRuleCategory,
  } = useRuleCategories()
  const editState = useEditState()
  const { operationError, execute } = useAsyncOperation()

  const handleCreateCategory = async (name: string) => {
    const newCategory = await execute(
      () => createRuleCategory({ name }),
      'カテゴリーの作成に失敗しました',
    )
    if (newCategory !== undefined) {
      onSelectCategory(newCategory.id)
    }
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    const result = await execute(
      () => updateRuleCategory(id, { name }),
      'カテゴリーの更新に失敗しました',
    )
    if (result !== undefined) {
      editState.cancelEdit()
    }
  }

  const handleDeleteCategory = async (category: RuleCategory) => {
    const result = await execute(
      () => deleteRuleCategory(category.id),
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
        <h2 className="mb-4 text-lg font-semibold">マイルール</h2>

        <ErrorMessage message={error || operationError || ''} />

        <RuleCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          editState={editState}
          onSelectCategory={onSelectCategory}
          onDelete={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
          onCreateCategory={handleCreateCategory}
        />
      </div>
    </div>
  )
}
