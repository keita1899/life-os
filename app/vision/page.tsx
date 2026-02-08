'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { VisionCategorySidebar } from '@/components/vision/VisionCategorySidebar'
import { VisionList } from '@/components/vision/VisionList'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useMode } from '@/lib/contexts/ModeContext'
import { useVisionCategories } from '@/hooks/useVisionCategories'
import { useVision } from '@/hooks/useVision'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import type { VisionItem } from '@/lib/types/vision-item'

export default function VisionPage() {
  const { mode } = useMode()
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

  if (mode !== 'life') {
    return null
  }

  return (
    <MainLayout>
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
                <Accordion
                  type="multiple"
                  defaultValue={defaultAccordionValues}
                  className="space-y-2"
                >
                  {groupedItemsByCategory
                    .filter(({ categoryId }) => categoryId !== null)
                    .map(({ categoryId, category, items }) => (
                      <AccordionItem
                        key={categoryId!}
                        value={categoryId!.toString()}
                        className="border-none"
                      >
                        <AccordionHeader>
                          <AccordionTrigger className="text-lg font-semibold py-2">
                            {category?.name}
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent className="pt-2">
                          <VisionList
                            items={items}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteItem}
                            onCreate={(title) =>
                              handleCreateItem(title).then(() => {})
                            }
                            showCreateForm={false}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
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
    </MainLayout>
  )
}
