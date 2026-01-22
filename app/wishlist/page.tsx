'use client'

import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { WishlistList } from '@/components/wishlist/WishlistList'
import { WishlistDialog } from '@/components/wishlist/WishlistDialog'
import { WishlistCategoryManagement } from '@/components/wishlist/WishlistCategoryManagement'
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
    toggleWishlistItemPurchased,
    deletePurchasedWishlistItems,
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
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] =
    useState(false)
  const [isDeletingPurchasedDialogOpen, setIsDeletingPurchasedDialogOpen] =
    useState(false)
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

  const groupedItems = useMemo(() => {
    const unpurchased = filteredItems.filter((item) => !item.purchased)
    const purchased = filteredItems.filter((item) => item.purchased)
    return [
      {
        key: 'unpurchased',
        title: '未購入',
        items: unpurchased,
      },
      {
        key: 'purchased',
        title: '購入済み',
        items: purchased,
      },
    ]
  }, [filteredItems])

  const totalPrice = useMemo(() => {
    return calculateTotalPrice(filteredItems)
  }, [filteredItems])

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
        price: input.price,
        purchased: input.purchased,
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

  const handleTogglePurchased = async (item: WishlistItem) => {
    try {
      setOperationError(null)
      await toggleWishlistItemPurchased(item.id, !item.purchased)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '欲しいものの購入状態の更新に失敗しました',
      )
    }
  }

  const handleDeletePurchasedItemsClick = () => {
    setIsDeletingPurchasedDialogOpen(true)
  }

  const handleDeletePurchasedItems = async () => {
    try {
      setOperationError(null)
      await deletePurchasedWishlistItems()
      setIsDeletingPurchasedDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '購入済み欲しいものの削除に失敗しました',
      )
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">欲しいものリスト</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCategoryManagementOpen(true)}
              >
                カテゴリー管理
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                欲しいものを追加
              </Button>
            </div>
          </div>
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
            <div className="mb-4 flex justify-end gap-2">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリー</SelectItem>
                  <SelectItem value="none">未分類</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="年を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全期間</SelectItem>
                  <SelectItem value="none">未設定</SelectItem>
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
            defaultValue={groupedItems.map((group) => group.key)}
          >
            {groupedItems.map((group) => (
              <AccordionItem key={group.key} value={group.key}>
                <AccordionHeader>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        {group.title}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        ({group.items.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>
                  <div className="space-y-4">
                    <WishlistList
                      items={group.items}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteClick}
                      onTogglePurchased={handleTogglePurchased}
                    />
                    {group.key === 'purchased' && group.items.length > 0 && (
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
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          </>
        )}

        <WishlistDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
          item={editingItem}
        />

        <Dialog
          open={isCategoryManagementOpen}
          onOpenChange={setIsCategoryManagementOpen}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>カテゴリー管理</DialogTitle>
            </DialogHeader>
            <WishlistCategoryManagement />
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={!!deletingItem}
          message={`「${deletingItem?.name}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeletingItem(undefined)}
        />

        <DeleteConfirmDialog
          open={isDeletingPurchasedDialogOpen}
          message={`購入済みの欲しいもの（${
            groupedItems.find((g) => g.key === 'purchased')?.items.length ?? 0
          }件）をすべて削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeletePurchasedItems}
          onCancel={() => setIsDeletingPurchasedDialogOpen(false)}
        />
      </div>
    </MainLayout>
  )
}
