'use client'

import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BucketListList } from '@/components/bucket-list/BucketListList'
import { BucketListDialog } from '@/components/bucket-list/BucketListDialog'
import { BucketListCategorySidebar } from '@/components/bucket-list/BucketListCategorySidebar'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useBucketList } from '@/hooks/useBucketList'
import { useMode } from '@/lib/contexts/ModeContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CreateBucketListItemInput,
  BucketListItem,
  UpdateBucketListItemInput,
} from '@/lib/types/bucket-list-item'

export default function BucketListPage() {
  const { mode } = useMode()
  const {
    items,
    isLoading,
    error,
    createBucketListItem,
    updateBucketListItem,
    deleteBucketListItem,
    toggleBucketListItemCompletion,
    deleteCompletedBucketListItems,
  } = useBucketList()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BucketListItem | undefined>(
    undefined,
  )
  const [deletingItem, setDeletingItem] = useState<BucketListItem | undefined>(
    undefined,
  )
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    items.forEach((item) => {
      if (item.targetYear !== null) years.add(item.targetYear)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [items])

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'achieved') {
      return items.filter((item) => item.completed)
    }
    let filtered = items
    if (selectedCategoryId === 'none') {
      filtered = filtered.filter((item) => item.categoryId === null)
    } else if (selectedCategoryId !== 'all') {
      const categoryId = Number(selectedCategoryId)
      filtered = filtered.filter((item) => item.categoryId === categoryId)
    }
    if (selectedYear === 'none') {
      filtered = filtered.filter((item) => item.targetYear === null)
    } else if (selectedYear !== 'all') {
      const year = Number(selectedYear)
      filtered = filtered.filter((item) => item.targetYear === year)
    }
    return filtered
  }, [items, selectedCategoryId, selectedYear])

  const incompleteByMonth = useMemo(() => {
    const yearFilter =
      selectedYear === 'all'
        ? () => true
        : selectedYear === 'none'
          ? (item: BucketListItem) => item.targetYear === null
          : (item: BucketListItem) => item.targetYear === Number(selectedYear)
    const incomplete = filteredItems.filter((item) => !item.completed && yearFilter(item))
    const byMonth: Record<number, BucketListItem[]> = {}
    const unset: BucketListItem[] = []
    for (let m = 1; m <= 12; m++) byMonth[m] = []
    incomplete.forEach((item) => {
      if (item.targetMonth != null) {
        byMonth[item.targetMonth] = byMonth[item.targetMonth] ?? []
        byMonth[item.targetMonth].push(item)
      } else {
        unset.push(item)
      }
    })
    return { byMonth, unset }
  }, [filteredItems, selectedYear])

  const completedItems = useMemo(
    () => filteredItems.filter((item) => item.completed),
    [filteredItems],
  )

  const defaultAccordionValues = useMemo(() => {
    const values: string[] = []
    Array.from({ length: 12 }, (_, i) => i + 1)
      .filter((month) => (incompleteByMonth.byMonth[month] ?? []).length > 0)
      .forEach((month) => values.push(`month-${month}`))
    if (incompleteByMonth.unset.length > 0) values.push('month-unset')
    values.push('completed')
    return values
  }, [incompleteByMonth])

  if (mode !== 'life') {
    return null
  }

  const handleCreateItem = async (input: CreateBucketListItemInput) => {
    try {
      setOperationError(null)
      await createBucketListItem(input)
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'やりたいことの作成に失敗しました',
      )
    }
  }

  const handleUpdateItem = async (input: CreateBucketListItemInput) => {
    if (!editingItem) return

    try {
      setOperationError(null)
      const updateInput: UpdateBucketListItemInput = {
        title: input.title,
        categoryId: input.categoryId,
        targetYear: input.targetYear,
        targetMonth: input.targetMonth,
      }
      await updateBucketListItem(editingItem.id, updateInput)
      setIsDialogOpen(false)
      setEditingItem(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'やりたいことの更新に失敗しました',
      )
    }
  }

  const handleEditItem = (item: BucketListItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingItem(undefined)
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return

    try {
      setOperationError(null)
      await deleteBucketListItem(deletingItem.id)
      setDeletingItem(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'やりたいことの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (item: BucketListItem) => {
    setDeletingItem(item)
  }

  const handleToggleCompletion = async (item: BucketListItem) => {
    try {
      setOperationError(null)
      await toggleBucketListItemCompletion(item.id, !item.completed)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'やりたいことの完了状態の更新に失敗しました',
      )
    }
  }

  const handleDeleteCompletedItemsClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedItems = async () => {
    try {
      setOperationError(null)
      await deleteCompletedBucketListItems()
      setIsDeletingCompletedDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '完了済みやりたいことの削除に失敗しました',
      )
    }
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <BucketListCategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">やりたいことリスト</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                やりたいことを作成
              </Button>
            </div>

            <ErrorMessage
              message={operationError || error || ''}
              onDismiss={operationError ? () => setOperationError(null) : undefined}
            />

            {isLoading ? (
              <Loading />
            ) : selectedCategoryId === 'achieved' ? (
              <div className="space-y-4">
                <BucketListList
                  items={filteredItems}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteClick}
                  onToggleCompletion={handleToggleCompletion}
                />
                {filteredItems.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDeleteCompletedItemsClick}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      完了済みを一括削除
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="年を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="none">未定</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={defaultAccordionValues}
                  key={`${selectedYear}-${selectedCategoryId}-${items.length}`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1)
                    .filter((month) => (incompleteByMonth.byMonth[month] ?? []).length > 0)
                    .map((month) => {
                      const monthItems = incompleteByMonth.byMonth[month] ?? []
                      return (
                        <AccordionItem
                          key={month}
                          value={`month-${month}`}
                          className="border-none"
                        >
                          <AccordionHeader>
                            <AccordionTrigger className="hover:no-underline py-2">
                              <span className="inline-flex items-center gap-1">
                                <span className="text-stone-900 dark:text-stone-100">
                                  {month}月
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({monthItems.length})
                                </span>
                              </span>
                            </AccordionTrigger>
                          </AccordionHeader>
                          <AccordionContent className="pt-2">
                            <BucketListList
                              items={monthItems}
                              onEdit={handleEditItem}
                              onDelete={handleDeleteClick}
                              onToggleCompletion={handleToggleCompletion}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  {incompleteByMonth.unset.length > 0 && (
                    <AccordionItem
                      value="month-unset"
                      className="border-none"
                    >
                      <AccordionHeader>
                        <AccordionTrigger className="hover:no-underline py-2">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-stone-900 dark:text-stone-100">
                              未定
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({incompleteByMonth.unset.length})
                            </span>
                          </span>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent className="pt-2">
                        <BucketListList
                          items={incompleteByMonth.unset}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteClick}
                          onToggleCompletion={handleToggleCompletion}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  <AccordionItem value="completed" className="border-none">
                    <AccordionHeader>
                      <AccordionTrigger className="hover:no-underline py-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-stone-900 dark:text-stone-100">
                            完了済み
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({completedItems.length})
                          </span>
                        </span>
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent className="pt-2">
                      <div className="space-y-4">
                        <BucketListList
                          items={completedItems}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteClick}
                          onToggleCompletion={handleToggleCompletion}
                        />
                        {completedItems.length > 0 && (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={handleDeleteCompletedItemsClick}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              完了済みを一括削除
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}

            <BucketListDialog
              open={isDialogOpen}
              onOpenChange={handleDialogClose}
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              item={editingItem}
              defaultCategoryId={
                editingItem == null &&
                selectedCategoryId !== 'all' &&
                selectedCategoryId !== 'none' &&
                selectedCategoryId !== 'achieved'
                  ? selectedCategoryId
                  : undefined
              }
            />

            <DeleteConfirmDialog
              open={!!deletingItem}
              message={`「${deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeleteItem}
              onCancel={() => setDeletingItem(undefined)}
            />

            <DeleteConfirmDialog
              open={isDeletingCompletedDialogOpen}
              message={`完了済みのやりたいこと（${
                items.filter((item) => item.completed).length
              }件）をすべて削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeleteCompletedItems}
              onCancel={() => setIsDeletingCompletedDialogOpen(false)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
