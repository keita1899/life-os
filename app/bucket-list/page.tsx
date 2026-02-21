'use client'

import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import {
  BucketListList,
  BucketListDialog,
  BucketListCategorySidebar,
  useBucketList,
  useBucketListCategories,
  getDateFromBucketItem,
  type CreateBucketListItemInput,
  type BucketListItem,
  type UpdateBucketListItemInput,
} from '@/features/bucket-list'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { EmptyState } from '@/components/ui/empty-state'
import { useEvents } from '@/features/events'
import { useTasks, TaskDialog } from '@/features/tasks'
import { EventDialog } from '@/features/events'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateEventInput } from '@/features/events'
import type { CreateTaskInput } from '@/features/tasks'

export default function BucketListPage() {
  const {
    items,
    isLoading,
    error,
    createBucketListItem,
    updateBucketListItem,
    deleteBucketListItem,
    toggleBucketListItemCompletion,
    deleteBucketListItemsByIds,
  } = useBucketList()
  const { categories } = useBucketListCategories()
  const { createEvent } = useEvents()
  const { createTask } = useTasks()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const {
    isDialogOpen,
    editingItem,
    handleEdit: handleEditItem,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<BucketListItem>()
  const deleteConfirm = useDeleteConfirm<BucketListItem>()
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [convertingToEventItem, setConvertingToEventItem] = useState<
    BucketListItem | undefined
  >(undefined)
  const [convertingToTaskItem, setConvertingToTaskItem] = useState<
    BucketListItem | undefined
  >(undefined)
  const { operationError, setOperationError, execute } = useAsyncOperation()

  const categoryCounts = useMemo(() => {
    const byCategoryId: Record<number, number> = {}
    categories.forEach((cat) => {
      byCategoryId[cat.id] = items.filter((i) => i.categoryId === cat.id).length
    })
    return {
      all: items.length,
      none: items.filter((i) => i.categoryId === null).length,
      achieved: items.filter((i) => i.completed).length,
      byCategoryId,
    }
  }, [items, categories])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    items.forEach((item) => {
      if (item.targetYear !== null) years.add(item.targetYear)
    })
    return Array.from(years).sort((a, b) => a - b)
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

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all') return 'すべて'
    if (selectedCategoryId === 'none') return '未分類'
    if (selectedCategoryId === 'achieved') return '達成リスト'
    const category = categories.find(
      (c) => c.id.toString() === selectedCategoryId,
    )
    return category?.name ?? ''
  }, [selectedCategoryId, categories])

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

  const accordionKeys = useMemo(() => {
    const values: string[] = []
    Array.from({ length: 12 }, (_, i) => i + 1)
      .filter((month) => (incompleteByMonth.byMonth[month] ?? []).length > 0)
      .forEach((month) => values.push(`month-${month}`))
    if (incompleteByMonth.unset.length > 0) values.push('month-unset')
    if (completedItems.length > 0) values.push('completed')
    return values
  }, [incompleteByMonth, completedItems.length])

  const { openKeys: openAccordionKeys, setOpenKeys: setOpenAccordionKeys } =
    useAutoExpandAccordion(accordionKeys)

  const handleCreateItem = async (input: CreateBucketListItemInput) => {
    const result = await execute(
      () => createBucketListItem(input),
      'やりたいことの作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleUpdateItem = async (input: CreateBucketListItemInput) => {
    if (!editingItem) return

    const updateInput: UpdateBucketListItemInput = {
      title: input.title,
      categoryId: input.categoryId,
      targetYear: input.targetYear,
      targetMonth: input.targetMonth,
    }
    const result = await execute(
      () => updateBucketListItem(editingItem.id, updateInput),
      'やりたいことの更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  const handleDeleteItem = async () => {
    const item = deleteConfirm.deletingItem
    if (!item) return

    const result = await execute(
      async () => {
        await deleteBucketListItem(item.id)
        return true
      },
      'やりたいことの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleCompletion = async (item: BucketListItem) => {
    await execute(
      () => toggleBucketListItemCompletion(item.id, !item.completed),
      'やりたいことの完了状態の更新に失敗しました',
    )
  }

  const handleDeleteCompletedItemsClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedItems = async () => {
    const ids = completedItems.map((item) => item.id)
    if (ids.length === 0) return

    const result = await execute(
      async () => {
        await deleteBucketListItemsByIds(ids)
        return true
      },
      '達成済みやりたいことの削除に失敗しました',
    )
    if (result !== undefined) {
      setIsDeletingCompletedDialogOpen(false)
    }
  }

  const handleConvertToEvent = (item: BucketListItem) => {
    setConvertingToEventItem(item)
  }

  const handleConvertToTask = (item: BucketListItem) => {
    setConvertingToTaskItem(item)
  }

  const handleCreateEventFromBucketItem = async (input: CreateEventInput) => {
    const item = convertingToEventItem
    if (!item) return

    const result = await execute(
      async () => {
        await createEvent(input)
        await deleteBucketListItem(item.id)
        return true
      },
      '予定の作成に失敗しました',
    )
    if (result !== undefined) {
      setConvertingToEventItem(undefined)
    }
  }

  const handleCreateTaskFromBucketItem = async (input: CreateTaskInput) => {
    const item = convertingToTaskItem
    if (!item) return

    const result = await execute(
      async () => {
        await createTask(input)
        await deleteBucketListItem(item.id)
        return true
      },
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      setConvertingToTaskItem(undefined)
    }
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          <BucketListCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            counts={categoryCounts}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">{selectedCategoryName}</h1>
              <CreateButton label="やりたいことを作成" onClick={handleCreateClick} />
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
                  onDelete={deleteConfirm.handleDeleteClick}
                  onToggleCompletion={handleToggleCompletion}
                  onConvertToEvent={handleConvertToEvent}
                  onConvertToTask={handleConvertToTask}
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
                {filteredItems.length === 0 ? (
                  <EmptyState message="やりたいことがありません" />
                ) : (
                <GroupedAccordion
                  value={openAccordionKeys}
                  onValueChange={setOpenAccordionKeys}
                  items={[
                    ...Array.from({ length: 12 }, (_, i) => i + 1)
                      .filter(
                        (month) =>
                          (incompleteByMonth.byMonth[month] ?? []).length > 0,
                      )
                      .map((month) => {
                        const monthItems =
                          incompleteByMonth.byMonth[month] ?? []
                        return {
                          key: `month-${month}`,
                          itemClassName: 'border-none',
                          triggerClassName: 'py-2',
                          contentClassName: 'pt-2',
                          trigger: (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-stone-900 dark:text-stone-100">
                                {month}月
                              </span>
                              {monthItems.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {monthItems.length}
                                </span>
                              )}
                            </span>
                          ),
                          content: (
                            <BucketListList
                              items={monthItems}
                              onEdit={handleEditItem}
                              onDelete={deleteConfirm.handleDeleteClick}
                              onToggleCompletion={handleToggleCompletion}
                              onConvertToEvent={handleConvertToEvent}
                              onConvertToTask={handleConvertToTask}
                            />
                          ),
                        }
                      }),
                    ...(incompleteByMonth.unset.length > 0
                      ? [
                          {
                            key: 'month-unset',
                            itemClassName: 'border-none',
                            triggerClassName: 'py-2',
                            contentClassName: 'pt-2',
                            trigger: (
                              <span className="inline-flex items-center gap-1">
                                <span className="text-stone-900 dark:text-stone-100">
                                  未定
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {incompleteByMonth.unset.length}
                                </span>
                              </span>
                            ),
                            content: (
                              <BucketListList
                                items={incompleteByMonth.unset}
                                onEdit={handleEditItem}
                                onDelete={deleteConfirm.handleDeleteClick}
                                onToggleCompletion={handleToggleCompletion}
                                onConvertToEvent={handleConvertToEvent}
                                onConvertToTask={handleConvertToTask}
                              />
                            ),
                          },
                        ]
                      : []),
                    ...(completedItems.length > 0
                      ? [
                          {
                            key: 'completed',
                            itemClassName: 'border-none',
                            triggerClassName: 'py-2',
                            contentClassName: 'pt-2',
                            trigger: (
                              <span className="inline-flex items-center gap-1">
                                <span className="text-stone-900 dark:text-stone-100">
                                  達成済み
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {completedItems.length}
                                </span>
                              </span>
                            ),
                            content: (
                              <div className="space-y-4">
                                <BucketListList
                                  items={completedItems}
                                  onEdit={handleEditItem}
                                  onDelete={deleteConfirm.handleDeleteClick}
                                  onToggleCompletion={handleToggleCompletion}
                                  onConvertToEvent={handleConvertToEvent}
                                  onConvertToTask={handleConvertToTask}
                                />
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleDeleteCompletedItemsClick}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    達成済みを一括削除
                                  </Button>
                                </div>
                              </div>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
                )}
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
              open={!!deleteConfirm.deletingItem}
              message={`「${deleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeleteItem}
              onCancel={deleteConfirm.handleDeleteCancel}
            />

            <DeleteConfirmDialog
              open={isDeletingCompletedDialogOpen}
              message={`達成済みのやりたいこと（${completedItems.length}件）をすべて削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeleteCompletedItems}
              onCancel={() => setIsDeletingCompletedDialogOpen(false)}
            />

            <EventDialog
              open={!!convertingToEventItem}
              onOpenChange={(open) => {
                if (!open) setConvertingToEventItem(undefined)
              }}
              onSubmit={handleCreateEventFromBucketItem}
              defaultTitle={convertingToEventItem?.title}
              defaultStartDate={
                convertingToEventItem
                  ? getDateFromBucketItem(convertingToEventItem)
                  : undefined
              }
            />

            <TaskDialog
              open={!!convertingToTaskItem}
              onOpenChange={(open) => {
                if (!open) setConvertingToTaskItem(undefined)
              }}
              onSubmit={handleCreateTaskFromBucketItem}
              defaultTitle={convertingToTaskItem?.title}
              defaultExecutionDate={
                convertingToTaskItem
                  ? getDateFromBucketItem(convertingToTaskItem)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}
