'use client'

import { useState, useMemo } from 'react'
import {
  VisionCategorySidebar,
  VisionList,
  useVision,
  useVisionCategories,
  type VisionItem,
} from '@/features/vision'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { useCrossGroupDnd } from '@/hooks/useCrossGroupDnd'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { DragOverlayPreview } from '@/components/ui/drag-overlay-preview'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'

export default function VisionPage() {
  const { categories } = useVisionCategories()
  const {
    items,
    isLoading,
    error,
    createVisionItem,
    updateVisionItem,
    deleteVisionItem,
    reorderVisionItems,
  } = useVision()
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | 'all' | null
  >('all')
  const { operationError, setOperationError, execute } = useAsyncOperation()

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null) {
      return 'すべて'
    }
    const category = categories.find((c) => c.id === selectedCategoryId)
    return category ? category.name : '不明なカテゴリー'
  }, [selectedCategoryId, categories])

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null) {
      return items
    }
    return items.filter((item) => item.categoryId === selectedCategoryId)
  }, [items, selectedCategoryId])

  const groupedItemsByCategory = useMemo(() => {
    if (selectedCategoryId !== 'all' && selectedCategoryId !== null) {
      return null
    }

    const grouped = new Map<number | null, VisionItem[]>()
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    items.forEach((item) => {
      const categoryId = item.categoryId
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, [])
      }
      grouped.get(categoryId)!.push(item)
    })

    return Array.from(grouped.entries())
      .filter(([categoryId]) => categoryId !== null)
      .map(([categoryId, items]) => ({
        categoryId: categoryId!,
        category: categoryMap.get(categoryId!) || null,
        items: items.sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => (a.category?.sortOrder ?? 0) - (b.category?.sortOrder ?? 0))
  }, [items, categories, selectedCategoryId])

  const accordionKeys = useMemo(() => {
    if (!groupedItemsByCategory) return []
    return groupedItemsByCategory
      .filter(({ categoryId }) => categoryId !== null)
      .map(({ categoryId }) => categoryId!.toString())
  }, [groupedItemsByCategory])

  const { openKeys: openAccordionKeys, setOpenKeys: setOpenAccordionKeys } =
    useAutoExpandAccordion(accordionKeys)

  // クロスグループ DnD
  const dndGroups = useMemo(() => {
    if (!groupedItemsByCategory) return []
    return groupedItemsByCategory.map((g) => ({
      key: g.categoryId.toString(),
      items: g.items,
    }))
  }, [groupedItemsByCategory])

  const crossGroupDnd = useCrossGroupDnd({
    visibleGroups: dndGroups,
    allItems: items,
    reorderItems: reorderVisionItems,
    updateDate: async (id, categoryIdStr) => {
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : null
      await execute(
        () => updateVisionItem(id, { categoryId }),
        'ビジョンの移動に失敗しました',
      )
    },
    excludedGroupKeys: [],
  })

  const handleCreateItem = async (title: string, categoryId?: number | null) => {
    await execute(
      () =>
        createVisionItem({
          title,
          categoryId:
            categoryId !== undefined
              ? categoryId
              : selectedCategoryId === 'all' || selectedCategoryId === null
                ? null
                : selectedCategoryId,
        }),
      'ビジョンの作成に失敗しました',
    )
  }

  const handleUpdateItem = async (id: number, title: string) => {
    await execute(
      () => updateVisionItem(id, { title }),
      'ビジョンの更新に失敗しました',
    )
  }

  const handleDeleteItem = async (id: number) => {
    await execute(
      () => deleteVisionItem(id),
      'ビジョンの削除に失敗しました',
    )
  }

  const isAllView = selectedCategoryId === 'all' || selectedCategoryId === null
  const hasGroups = groupedItemsByCategory &&
    groupedItemsByCategory.filter(({ categoryId }) => categoryId !== null).length > 0

  const accordionContent = hasGroups ? (
    <GroupedAccordion
      value={openAccordionKeys}
      onValueChange={setOpenAccordionKeys}
      items={groupedItemsByCategory!
        .filter(({ categoryId }) => categoryId !== null)
        .map(({ categoryId, category, items }) => ({
          key: categoryId!.toString(),
          itemClassName: 'rounded-lg border border-border/50',
          triggerClassName: 'text-base font-semibold py-3 px-4',
          contentClassName: 'px-4 pb-3 pt-1',
          trigger: (
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary/60" />
              {category?.name}
              <span className="text-xs font-normal text-muted-foreground">
                {items.length}
              </span>
            </span>
          ),
          content: (
            <VisionList
              items={items}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              onCreate={(title) => handleCreateItem(title, categoryId)}
              onReorder={reorderVisionItems}
              groupKey={categoryId!.toString()}
              isDropTarget={crossGroupDnd.isDropTarget(categoryId!.toString())}
              insertBeforeId={crossGroupDnd.isDropTarget(categoryId!.toString()) ? crossGroupDnd.insertBeforeId : undefined}
            />
          ),
        }))}
      className="space-y-3"
    />
  ) : (
    <VisionList
      items={[]}
      onUpdate={handleUpdateItem}
      onDelete={handleDeleteItem}
      onCreate={(title) => handleCreateItem(title).then(() => {})}
      showCreateForm={false}
    />
  )

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          <VisionCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-8">
            <h1 className="mb-6 text-3xl font-bold">{selectedCategoryName}</h1>

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
              <VisionList
                items={filteredItems.sort((a, b) => a.order - b.order)}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onCreate={(title) => handleCreateItem(title).then(() => {})}
                onReorder={reorderVisionItems}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
