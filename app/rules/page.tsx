'use client'

import { useState, useMemo } from 'react'
import {
  RuleCategorySidebar,
  RuleList,
  useRules,
  useRuleCategories,
  type RuleItem,
} from '@/features/rules'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'

export default function RulesPage() {
  const { categories } = useRuleCategories()
  const {
    items,
    isLoading,
    error,
    createRuleItem,
    updateRuleItem,
    deleteRuleItem,
  } = useRules()
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

    const grouped = new Map<number, RuleItem[]>()

    // すべてのカテゴリーを空配列で初期化
    categories.forEach((c) => {
      grouped.set(c.id, [])
    })

    // アイテムを振り分け
    items.forEach((item) => {
      if (item.categoryId !== null && grouped.has(item.categoryId)) {
        grouped.get(item.categoryId)!.push(item)
      }
    })

    return Array.from(grouped.entries())
      .map(([categoryId, categoryItems]) => ({
        categoryId,
        category: categories.find((c) => c.id === categoryId) || null,
        items: categoryItems.sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => (a.category?.sortOrder ?? 0) - (b.category?.sortOrder ?? 0))
  }, [items, categories, selectedCategoryId])

  const accordionKeys = useMemo(() => {
    if (!groupedItemsByCategory) return []
    return groupedItemsByCategory.map(({ categoryId }) => categoryId.toString())
  }, [groupedItemsByCategory])

  const { openKeys: openAccordionKeys, setOpenKeys: setOpenAccordionKeys } =
    useAutoExpandAccordion(accordionKeys)

  const handleCreateItem = async (title: string, categoryId?: number | null) => {
    await execute(
      () =>
        createRuleItem({
          title,
          categoryId:
            categoryId !== undefined
              ? categoryId
              : selectedCategoryId === 'all' || selectedCategoryId === null
                ? null
                : selectedCategoryId,
        }),
      'マイルールの作成に失敗しました',
    )
  }

  const handleUpdateItem = async (id: number, title: string) => {
    await execute(
      () => updateRuleItem(id, { title }),
      'マイルールの更新に失敗しました',
    )
  }

  const handleDeleteItem = async (id: number) => {
    await execute(
      () => deleteRuleItem(id),
      'マイルールの削除に失敗しました',
    )
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          <RuleCategorySidebar
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
            ) : selectedCategoryId === 'all' || selectedCategoryId === null ? (
              groupedItemsByCategory &&
              groupedItemsByCategory.length > 0 ? (
                <GroupedAccordion
                  value={openAccordionKeys}
                  onValueChange={setOpenAccordionKeys}
                  items={groupedItemsByCategory.map(({ categoryId, category, items }) => ({
                      key: categoryId.toString(),
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
                        <RuleList
                          items={items}
                          onUpdate={handleUpdateItem}
                          onDelete={handleDeleteItem}
                          onCreate={(title) =>
                            handleCreateItem(title, categoryId)
                          }
                        />
                      ),
                    }))}
                  className="space-y-3"
                />
              ) : null
            ) : (
              <RuleList
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
