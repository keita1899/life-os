'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  InterviewCategorySidebar,
  InterviewList,
  InterviewDialog,
  useInterviewItems,
  useInterviewCategories,
  type InterviewItem,
  type CreateInterviewItemInput,
  type UpdateInterviewItemInput,
} from '@/features/dev/interview'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { CreateButton } from '@/components/ui/create-button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'

export default function InterviewPage() {
  const { categories } = useInterviewCategories()
  const {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
  } = useInterviewItems()

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | 'all' | 'none' | null
  >('all')
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const dialog = useDialogState<InterviewItem>()
  const deleteConfirm = useDeleteConfirm<InterviewItem>()
  const [dialogDefaultCategoryId, setDialogDefaultCategoryId] = useState<number | null>(null)

  const handleCreateWithCategory = useCallback((categoryId: number | null) => {
    setDialogDefaultCategoryId(categoryId)
    dialog.handleCreateClick()
  }, [dialog])

  const topLevelDefaultCategoryId = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null || selectedCategoryId === 'none') {
      return null
    }
    return selectedCategoryId
  }, [selectedCategoryId])

  const handleTopLevelCreate = useCallback(() => {
    handleCreateWithCategory(topLevelDefaultCategoryId)
  }, [handleCreateWithCategory, topLevelDefaultCategoryId])

  useCreateShortcut({
    onCreate: handleTopLevelCreate,
    enabled: !dialog.isDialogOpen,
  })

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null) {
      return 'すべて'
    }
    if (selectedCategoryId === 'none') {
      return '未分類'
    }
    const category = categories.find((c) => c.id === selectedCategoryId)
    return category ? category.name : '不明なカテゴリー'
  }, [selectedCategoryId, categories])

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null) {
      return items
    }
    if (selectedCategoryId === 'none') {
      return items.filter((item) => item.categoryId === null)
    }
    return items.filter((item) => item.categoryId === selectedCategoryId)
  }, [items, selectedCategoryId])

  const groupedItems = useMemo(() => {
    if (selectedCategoryId !== 'all' && selectedCategoryId !== null) {
      return null
    }

    const grouped = new Map<number | null, InterviewItem[]>()
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    items.forEach((item) => {
      const categoryId = item.categoryId
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, [])
      }
      grouped.get(categoryId)!.push(item)
    })

    const categorized = Array.from(grouped.entries())
      .filter(([categoryId]) => categoryId !== null)
      .map(([categoryId, groupItems]) => ({
        categoryId: categoryId!,
        category: categoryMap.get(categoryId!) || null,
        items: groupItems.sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => {
        const aName = a.category?.name || ''
        const bName = b.category?.name || ''
        return aName.localeCompare(bName, 'ja')
      })

    const uncategorized = grouped.get(null) || []

    return { categorized, uncategorized }
  }, [items, categories, selectedCategoryId])

  const accordionKeys = useMemo(() => {
    if (!groupedItems) return []
    const keys = groupedItems.categorized.map(({ categoryId }) => categoryId.toString())
    if (groupedItems.uncategorized.length > 0) {
      keys.push('uncategorized')
    }
    return keys
  }, [groupedItems])

  const { openKeys, setOpenKeys } = useAutoExpandAccordion(accordionKeys)

  const handleCreate = async (input: CreateInterviewItemInput) => {
    const result = await execute(
      () => createItem(input),
      'Q&Aの作成に失敗しました',
    )
    if (result !== undefined) {
      dialog.handleDialogClose(false)
    }
  }

  const handleUpdate = async (input: CreateInterviewItemInput) => {
    if (!dialog.editingItem) return
    const result = await execute(
      () => updateItem(dialog.editingItem!.id, input),
      'Q&Aの更新に失敗しました',
    )
    if (result !== undefined) {
      dialog.handleDialogClose(false)
    }
  }

  const handleInlineUpdate = useCallback(async (id: number, input: UpdateInterviewItemInput) => {
    await execute(
      () => updateItem(id, input),
      'Q&Aの更新に失敗しました',
    )
  }, [execute, updateItem])

  const handleDelete = async () => {
    const item = deleteConfirm.deletingItem
    if (!item) return
    const result = await execute(
      () => deleteItem(item.id),
      'Q&Aの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          <InterviewCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">{selectedCategoryName}</h1>
              <CreateButton label="Q&Aを作成" onClick={handleTopLevelCreate} />
            </div>

            <ErrorMessage
              message={error || operationError || ''}
              onDismiss={operationError ? () => setOperationError(null) : undefined}
            />

            {isLoading ? (
              <Loading />
            ) : selectedCategoryId === 'all' || selectedCategoryId === null ? (
              groupedItems && (groupedItems.categorized.length > 0 || groupedItems.uncategorized.length > 0) ? (
                <div className="space-y-6">
                  {groupedItems.categorized.length > 0 && (
                    <GroupedAccordion
                      value={openKeys}
                      onValueChange={setOpenKeys}
                      items={[
                        ...groupedItems.categorized.map(({ categoryId, category, items: groupItems }) => ({
                          key: categoryId.toString(),
                          itemClassName: 'rounded-lg border border-border/50',
                          triggerClassName: 'text-base font-semibold py-3 px-4',
                          contentClassName: 'px-4 pb-3 pt-1',
                          trigger: (
                            <span className="flex items-center gap-2">
                              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary/60" />
                              {category?.name}
                              <span className="text-xs font-normal text-muted-foreground">
                                {groupItems.length}
                              </span>
                            </span>
                          ),
                          content: (
                            <InterviewList
                              items={groupItems}
                              onEdit={dialog.handleEdit}
                              onDelete={deleteConfirm.handleDeleteClick}
                              onUpdate={handleInlineUpdate}
                              onCreate={() => handleCreateWithCategory(categoryId)}
                            />
                          ),
                        })),
                        ...(groupedItems.uncategorized.length > 0
                          ? [{
                              key: 'uncategorized',
                              itemClassName: 'rounded-lg border border-border/50',
                              triggerClassName: 'text-base font-semibold py-3 px-4',
                              contentClassName: 'px-4 pb-3 pt-1',
                              trigger: (
                                <span className="flex items-center gap-2">
                                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                                  未分類
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {groupedItems.uncategorized.length}
                                  </span>
                                </span>
                              ),
                              content: (
                                <InterviewList
                                  items={groupedItems.uncategorized.sort((a, b) => a.order - b.order)}
                                  onEdit={dialog.handleEdit}
                                  onDelete={deleteConfirm.handleDeleteClick}
                                  onUpdate={handleInlineUpdate}
                                  onCreate={() => handleCreateWithCategory(null)}
                                />
                              ),
                            }]
                          : []),
                      ]}
                      className="space-y-3"
                    />
                  )}
                  {groupedItems.categorized.length === 0 && groupedItems.uncategorized.length > 0 && (
                    <InterviewList
                      items={groupedItems.uncategorized.sort((a, b) => a.order - b.order)}
                      onEdit={dialog.handleEdit}
                      onDelete={deleteConfirm.handleDeleteClick}
                      onUpdate={handleInlineUpdate}
                      onCreate={() => handleCreateWithCategory(null)}
                    />
                  )}
                </div>
              ) : (
                <InterviewList
                  items={[]}
                  onEdit={dialog.handleEdit}
                  onDelete={deleteConfirm.handleDeleteClick}
                  onUpdate={handleInlineUpdate}
                  onCreate={handleTopLevelCreate}
                />
              )
            ) : (
              <InterviewList
                items={filteredItems.sort((a, b) => a.order - b.order)}
                onEdit={dialog.handleEdit}
                onDelete={deleteConfirm.handleDeleteClick}
                onUpdate={handleInlineUpdate}
                onCreate={handleTopLevelCreate}
              />
            )}
          </div>
        </div>
      </div>

      <InterviewDialog
        open={dialog.isDialogOpen}
        onOpenChange={dialog.handleDialogClose}
        onSubmit={dialog.editingItem ? handleUpdate : handleCreate}
        item={dialog.editingItem}
        categories={categories}
        defaultCategoryId={dialogDefaultCategoryId}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm.deletingItem}
        message={`「${deleteConfirm.deletingItem?.question}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDelete}
        onCancel={deleteConfirm.handleDeleteCancel}
      />
    </>
  )
}
