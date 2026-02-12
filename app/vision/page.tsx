'use client'

import { useState, useMemo } from 'react'
import {
  VisionCategorySidebar,
  VisionList,
  useVision,
  useVisionCategories,
  type VisionItem,
} from '@/features/vision'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
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
      .sort((a, b) => {
        const aName = a.category?.name || ''
        const bName = b.category?.name || ''
        return aName.localeCompare(bName, 'ja')
      })
  }, [items, categories, selectedCategoryId])

  const defaultAccordionValues = useMemo(() => {
    if (!groupedItemsByCategory) return []
    return groupedItemsByCategory.map(({ categoryId }) =>
      categoryId.toString(),
    )
  }, [groupedItemsByCategory])

  const handleCreateItem = async (title: string) => {
    await execute(
      () =>
        createVisionItem({
          title,
          categoryId:
            selectedCategoryId === 'all' || selectedCategoryId === null
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

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <VisionCategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-8">
            <h1 className="mb-6 text-3xl font-bold">{selectedCategoryName}</h1>

            <ErrorMessage
              message={error || operationError || ''}
              onDismiss={operationError ? () => setOperationError(null) : undefined}
            />

            {isLoading ? (
              <Loading />
            ) : selectedCategoryId === 'all' || selectedCategoryId === null ? (
              groupedItemsByCategory &&
              groupedItemsByCategory.filter(
                ({ categoryId }) => categoryId !== null,
              ).length > 0 ? (
                <GroupedAccordion
                  items={groupedItemsByCategory
                    .filter(({ categoryId }) => categoryId !== null)
                    .map(({ categoryId, category, items }) => ({
                      key: categoryId!.toString(),
                      itemClassName: 'border-none',
                      triggerClassName: 'text-lg font-semibold py-2',
                      contentClassName: 'pt-2',
                      trigger: category?.name,
                      content: (
                        <VisionList
                          items={items}
                          onUpdate={handleUpdateItem}
                          onDelete={handleDeleteItem}
                          onCreate={(title) =>
                            handleCreateItem(title).then(() => {})
                          }
                          showCreateForm={false}
                        />
                      ),
                    }))}
                  defaultValue={defaultAccordionValues}
                  className="space-y-2"
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
            ) : (
              <VisionList
                items={filteredItems.sort((a, b) => a.order - b.order)}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onCreate={(title) => handleCreateItem(title).then(() => {})}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
