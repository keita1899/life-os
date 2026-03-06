'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  TopicCategorySidebar,
  TopicList,
  TopicDialog,
  DailyTopic,
  useTopicItems,
  useTopicCategories,
  type TopicItem,
  type CreateTopicItemInput,
  type UpdateTopicItemInput,
} from '@/features/topics'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { useCrossGroupDnd } from '@/hooks/useCrossGroupDnd'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { DragOverlayPreview } from '@/components/ui/drag-overlay-preview'
import { CreateButton } from '@/components/ui/create-button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'

export default function TopicsPage() {
  const { categories } = useTopicCategories()
  const {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  } = useTopicItems()

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | 'all' | 'none' | null
  >('all')
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const dialog = useDialogState<TopicItem>()
  const deleteConfirm = useDeleteConfirm<TopicItem>()
  const [dialogDefaultCategoryId, setDialogDefaultCategoryId] = useState<number | null>(null)

  const handleCreateWithCategory = useCallback((categoryId: number | null): void => {
    setDialogDefaultCategoryId(categoryId)
    dialog.handleCreateClick()
  }, [dialog])

  const topLevelDefaultCategoryId = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null || selectedCategoryId === 'none') {
      return null
    }
    return selectedCategoryId
  }, [selectedCategoryId])

  const handleTopLevelCreate = useCallback((): void => {
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

    const grouped = new Map<number | null, TopicItem[]>()
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
      .sort((a, b) => (a.category?.sortOrder ?? 0) - (b.category?.sortOrder ?? 0))

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

  const toItemLike = useCallback((item: TopicItem) => ({
    id: item.id,
    title: item.question,
  }), [])

  const dndGroups = useMemo(() => {
    if (!groupedItems) return []
    const groups = groupedItems.categorized.map((g) => ({
      key: g.categoryId.toString(),
      items: g.items.map(toItemLike),
    }))
    if (groupedItems.uncategorized.length > 0) {
      groups.push({
        key: 'none',
        items: [...groupedItems.uncategorized].sort((a, b) => a.order - b.order).map(toItemLike),
      })
    }
    return groups
  }, [groupedItems, toItemLike])

  const crossGroupDnd = useCrossGroupDnd({
    visibleGroups: dndGroups,
    allItems: items.map(toItemLike),
    reorderItems,
    updateDate: async (id, categoryIdStr) => {
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : null
      await execute(
        () => updateItem(id, { categoryId }),
        'トピックの移動に失敗しました',
      )
    },
    excludedGroupKeys: [],
  })

  const handleCreate = async (input: CreateTopicItemInput): Promise<void> => {
    const result = await execute(
      () => createItem(input),
      'トピックの作成に失敗しました',
    )
    if (result !== undefined) {
      dialog.handleDialogClose(false)
    }
  }

  const handleUpdate = async (input: CreateTopicItemInput): Promise<void> => {
    if (!dialog.editingItem) return
    const result = await execute(
      () => updateItem(dialog.editingItem!.id, input),
      'トピックの更新に失敗しました',
    )
    if (result !== undefined) {
      dialog.handleDialogClose(false)
    }
  }

  const handleInlineUpdate = useCallback(async (id: number, input: UpdateTopicItemInput): Promise<void> => {
    const result = await execute(
      () => updateItem(id, input),
      'トピックの更新に失敗しました',
    )
    if (result === undefined) {
      throw new Error('トピックの更新に失敗しました')
    }
  }, [execute, updateItem])

  const handleDelete = async (): Promise<void> => {
    const item = deleteConfirm.deletingItem
    if (!item) return
    const result = await execute(
      () => deleteItem(item.id),
      'トピックの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const isAllView = selectedCategoryId === 'all' || selectedCategoryId === null
  const hasContent = groupedItems && (groupedItems.categorized.length > 0 || groupedItems.uncategorized.length > 0)

  const accordionContent = hasContent ? (
    <div className="space-y-6">
      {groupedItems!.categorized.length > 0 && (
        <GroupedAccordion
          value={openKeys}
          onValueChange={setOpenKeys}
          items={[
            ...groupedItems!.categorized.map(({ categoryId, category, items: groupItems }) => ({
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
                <TopicList
                  items={groupItems}
                  onEdit={dialog.handleEdit}
                  onDelete={deleteConfirm.handleDeleteClick}
                  onUpdate={handleInlineUpdate}
                  onCreate={() => handleCreateWithCategory(categoryId)}
                  onReorder={reorderItems}
                  groupKey={categoryId.toString()}
                  isDropTarget={crossGroupDnd.isDropTarget(categoryId.toString())}
                  insertBeforeId={crossGroupDnd.isDropTarget(categoryId.toString()) ? crossGroupDnd.insertBeforeId : undefined}
                />
              ),
            })),
            ...(groupedItems!.uncategorized.length > 0
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
                        {groupedItems!.uncategorized.length}
                      </span>
                    </span>
                  ),
                  content: (
                    <TopicList
                      items={[...groupedItems!.uncategorized].sort((a, b) => a.order - b.order)}
                      onEdit={dialog.handleEdit}
                      onDelete={deleteConfirm.handleDeleteClick}
                      onUpdate={handleInlineUpdate}
                      onCreate={() => handleCreateWithCategory(null)}
                      onReorder={reorderItems}
                      groupKey="none"
                      isDropTarget={crossGroupDnd.isDropTarget('none')}
                      insertBeforeId={crossGroupDnd.isDropTarget('none') ? crossGroupDnd.insertBeforeId : undefined}
                    />
                  ),
                }]
              : []),
          ]}
          className="space-y-3"
        />
      )}
      {groupedItems!.categorized.length === 0 && groupedItems!.uncategorized.length > 0 && (
        <TopicList
          items={[...groupedItems!.uncategorized].sort((a, b) => a.order - b.order)}
          onEdit={dialog.handleEdit}
          onDelete={deleteConfirm.handleDeleteClick}
          onUpdate={handleInlineUpdate}
          onCreate={() => handleCreateWithCategory(null)}
          onReorder={reorderItems}
        />
      )}
    </div>
  ) : (
    <TopicList
      items={[]}
      onEdit={dialog.handleEdit}
      onDelete={deleteConfirm.handleDeleteClick}
      onUpdate={handleInlineUpdate}
      onCreate={handleTopLevelCreate}
    />
  )

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          <TopicCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">{selectedCategoryName}</h1>
              <CreateButton label="トピックを作成" onClick={handleTopLevelCreate} />
            </div>

            <DailyTopic items={items} />

            <ErrorMessage
              message={error || operationError || ''}
              onDismiss={operationError ? () => setOperationError(null) : undefined}
            />

            {isLoading ? (
              <Loading />
            ) : isAllView ? (
              <DndContext
                sensors={crossGroupDnd.sensors}
                collisionDetection={closestCenter}
                onDragStart={crossGroupDnd.handleDragStart}
                onDragOver={crossGroupDnd.handleDragOver}
                onDragEnd={crossGroupDnd.handleDragEnd}
                onDragCancel={crossGroupDnd.handleDragCancel}
              >
                {accordionContent}
                <DragOverlayPreview activeItem={crossGroupDnd.activeTask} />
              </DndContext>
            ) : (
              <TopicList
                items={[...filteredItems].sort((a, b) => a.order - b.order)}
                onEdit={dialog.handleEdit}
                onDelete={deleteConfirm.handleDeleteClick}
                onUpdate={handleInlineUpdate}
                onCreate={handleTopLevelCreate}
                onReorder={reorderItems}
              />
            )}
          </div>
        </div>
      </div>

      <TopicDialog
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
