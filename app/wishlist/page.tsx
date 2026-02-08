'use client'

import { useState, useMemo } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { WishlistList } from '@/components/wishlist/WishlistList'
import { WishlistDialog } from '@/components/wishlist/WishlistDialog'
import { WishlistCategorySidebar } from '@/components/wishlist/WishlistCategorySidebar'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useWishlist } from '@/hooks/useWishlist'
import { useWishlistCategories } from '@/hooks/useWishlistCategories'
import { useMode } from '@/lib/contexts/ModeContext'
import { calculateTotalPrice } from '@/lib/wishlist'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CreateWishlistItemInput,
  WishlistItem,
  UpdateWishlistItemInput,
} from '@/lib/types/wishlist-item'

export default function WishlistPage() {
  const { mode } = useMode()
  const {
    items,
    isLoading,
    error,
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    deleteWishlistItemsByIds,
  } = useWishlist()
  const { categories } = useWishlistCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const {
    isDialogOpen,
    editingItem,
    handleEdit: handleEditItem,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<WishlistItem>()
  const deleteConfirm = useDeleteConfirm<WishlistItem>()
  const [isDeletingPurchasedDialogOpen, setIsDeletingPurchasedDialogOpen] =
    useState(false)
  const { operationError, setOperationError, execute } = useAsyncOperation()

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    items.forEach((item) => {
      if (item.targetYear !== null) {
        years.add(item.targetYear)
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [items])

  const filteredItems = useMemo(() => {
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

  const unpurchasedItems = useMemo(
    () => filteredItems.filter((item) => !item.purchased),
    [filteredItems],
  )
  const purchasedItems = useMemo(
    () => filteredItems.filter((item) => item.purchased),
    [filteredItems],
  )

  const totalPrice = useMemo(() => {
    return calculateTotalPrice(unpurchasedItems)
  }, [unpurchasedItems])

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all') return 'すべて'
    if (selectedCategoryId === 'none') return '未分類'
    const category = categories.find(
      (c) => c.id.toString() === selectedCategoryId,
    )
    return category?.name ?? ''
  }, [selectedCategoryId, categories])

  if (mode !== 'life') {
    return null
  }

  const handleCreateItem = async (input: CreateWishlistItemInput) => {
    const result = await execute(
      () => createWishlistItem(input),
      '欲しいものの作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleUpdateItem = async (input: CreateWishlistItemInput) => {
    if (!editingItem) return

    const updateInput: UpdateWishlistItemInput = {
      name: input.name,
      categoryId: input.categoryId,
      targetYear: input.targetYear,
      targetMonth: input.targetMonth,
      price: input.price,
    }
    const result = await execute(
      () => updateWishlistItem(editingItem.id, updateInput),
      '欲しいものの更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteItem = async () => {
    const item = deleteConfirm.deletingItem
    if (!item) return

    const result = await execute(
      async () => {
        await deleteWishlistItem(item.id)
        return true
      },
      '欲しいものの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleTogglePurchased = async (item: WishlistItem) => {
    await execute(
      () => updateWishlistItem(item.id, { purchased: !item.purchased }),
      '更新に失敗しました',
    )
  }

  const handleDeletePurchasedItemsClick = () => {
    setIsDeletingPurchasedDialogOpen(true)
  }

  const handleDeletePurchasedItems = async () => {
    const ids = purchasedItems.map((item) => item.id)
    if (ids.length === 0) return

    const result = await execute(
      async () => {
        await deleteWishlistItemsByIds(ids)
        return true
      },
      '購入済みの一括削除に失敗しました',
    )
    if (result !== undefined) {
      setIsDeletingPurchasedDialogOpen(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          <WishlistCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">欲しいものリスト</h1>
              <Button onClick={handleCreateClick}>
                <Plus className="mr-2 h-4 w-4" />
                欲しいものを作成
              </Button>
            </div>

            {totalPrice > 0 && (
              <div className="mb-6 border-b border-stone-200 py-4 dark:border-stone-800">
                <p className="text-lg text-muted-foreground">
                  未購入の合計金額:{' '}
                  <span className="font-semibold text-foreground tabular-nums">
                    {totalPrice.toLocaleString()}円
                  </span>
                </p>
              </div>
            )}

            <ErrorMessage
              message={operationError || error || ''}
              onDismiss={operationError ? () => setOperationError(null) : undefined}
            />

            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {selectedCategoryName}
                  </h2>
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
                  defaultValue={
                    purchasedItems.length > 0
                      ? ['unpurchased', 'purchased']
                      : ['unpurchased']
                  }
                >
                  <AccordionItem value="unpurchased">
                    <AccordionHeader>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                            未購入
                          </h2>
                          {unpurchasedItems.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {unpurchasedItems.length}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      <div className="space-y-4">
                        <WishlistList
                          items={unpurchasedItems}
                          onEdit={handleEditItem}
                          onDelete={deleteConfirm.handleDeleteClick}
                          onToggleCompletion={handleTogglePurchased}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  {purchasedItems.length > 0 && (
                    <AccordionItem value="purchased">
                      <AccordionHeader>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                              購入済
                            </h2>
                            <span className="text-sm text-muted-foreground">
                              {purchasedItems.length}
                            </span>
                          </div>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className="space-y-4">
                          <WishlistList
                            items={purchasedItems}
                            onEdit={handleEditItem}
                            onDelete={deleteConfirm.handleDeleteClick}
                            onToggleCompletion={handleTogglePurchased}
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={handleDeletePurchasedItemsClick}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              購入済みを一括削除
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </>
            )}

            <WishlistDialog
              open={isDialogOpen}
              onOpenChange={handleDialogClose}
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              item={editingItem}
              defaultCategoryId={
                editingItem == null &&
                selectedCategoryId !== 'all' &&
                selectedCategoryId !== 'none'
                  ? selectedCategoryId
                  : undefined
              }
            />

            <DeleteConfirmDialog
              open={!!deleteConfirm.deletingItem}
              message={`「${deleteConfirm.deletingItem?.name}」を削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeleteItem}
              onCancel={deleteConfirm.handleDeleteCancel}
            />

            <DeleteConfirmDialog
              open={isDeletingPurchasedDialogOpen}
              message={`購入済みの欲しいもの（${purchasedItems.length}件）をすべて削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeletePurchasedItems}
              onCancel={() => setIsDeletingPurchasedDialogOpen(false)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
