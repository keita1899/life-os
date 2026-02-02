'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
  } = useWishlist()
  const { categories } = useWishlistCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>(
    undefined,
  )
  const [deletingItem, setDeletingItem] = useState<WishlistItem | undefined>(
    undefined,
  )
  const [operationError, setOperationError] = useState<string | null>(null)

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

  const totalPrice = useMemo(() => {
    return calculateTotalPrice(filteredItems)
  }, [filteredItems])

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
    try {
      setOperationError(null)
      await createWishlistItem(input)
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '欲しいものの作成に失敗しました',
      )
    }
  }

  const handleUpdateItem = async (input: CreateWishlistItemInput) => {
    if (!editingItem) return

    try {
      setOperationError(null)
      const updateInput: UpdateWishlistItemInput = {
        name: input.name,
        categoryId: input.categoryId,
        targetYear: input.targetYear,
        targetMonth: input.targetMonth,
        price: input.price,
      }
      await updateWishlistItem(editingItem.id, updateInput)
      setIsDialogOpen(false)
      setEditingItem(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '欲しいものの更新に失敗しました',
      )
    }
  }

  const handleEditItem = (item: WishlistItem) => {
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
      await deleteWishlistItem(deletingItem.id)
      setDeletingItem(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '欲しいものの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (item: WishlistItem) => {
    setDeletingItem(item)
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <WishlistCategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">欲しいものリスト</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                欲しいものを追加
              </Button>
            </div>

            {totalPrice > 0 && (
              <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <div className="text-sm text-muted-foreground">未購入の合計金額</div>
                <div className="text-2xl font-bold">
                  {totalPrice.toLocaleString()}円
                </div>
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
                  defaultValue={['items']}
                >
                  <AccordionItem value="items">
                    <AccordionHeader>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                            未購入
                          </h2>
                          <span className="text-sm text-muted-foreground">
                            ({filteredItems.length})
                          </span>
                        </div>
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      <div className="space-y-4">
                        <WishlistList
                          items={filteredItems}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteClick}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
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
              open={!!deletingItem}
              message={`「${deletingItem?.name}」を削除しますか？この操作は取り消せません。`}
              onConfirm={handleDeleteItem}
              onCancel={() => setDeletingItem(undefined)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
