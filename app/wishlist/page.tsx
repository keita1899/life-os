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
    toggleWishlistItemCompletion,
    deleteCompletedWishlistItems,
  } = useWishlist()
  const { categories } = useWishlistCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>(
    undefined,
  )
  const [deletingItem, setDeletingItem] = useState<WishlistItem | undefined>(
    undefined,
  )
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] =
    useState(false)
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return items
    }
    if (selectedCategoryId === 'none') {
      return items.filter((item) => item.categoryId === null)
    }
    const categoryId = Number(selectedCategoryId)
    return items.filter((item) => item.categoryId === categoryId)
  }, [items, selectedCategoryId])

  const groupedItems = useMemo(() => {
    const incomplete = filteredItems.filter((item) => !item.completed)
    const completed = filteredItems.filter((item) => item.completed)
    return [
      {
        key: 'incomplete',
        title: '未完了',
        items: incomplete,
      },
      {
        key: 'completed',
        title: '完了済み',
        items: completed,
      },
    ]
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
        err instanceof Error ? err.message : 'やりたいことの作成に失敗しました',
      )
    }
  }

  const handleUpdateItem = async (input: CreateWishlistItemInput) => {
    if (!editingItem) return

    try {
      setOperationError(null)
      const updateInput: UpdateWishlistItemInput = {
        title: input.title,
        categoryId: input.categoryId,
        targetYear: input.targetYear,
      }
      await updateWishlistItem(editingItem.id, updateInput)
      setIsDialogOpen(false)
      setEditingItem(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'やりたいことの更新に失敗しました',
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
        err instanceof Error ? err.message : 'やりたいことの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (item: WishlistItem) => {
    setDeletingItem(item)
  }

  const handleToggleCompletion = async (item: WishlistItem) => {
    try {
      setOperationError(null)
      await toggleWishlistItemCompletion(item.id, !item.completed)
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
      await deleteCompletedWishlistItems()
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
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">やりたいことリスト</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCategoryManagementOpen(true)}
              >
                カテゴリー管理
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                やりたいことを作成
              </Button>
            </div>
          </div>
        </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-4">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="none">カテゴリーなし</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
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
                      onToggleCompletion={handleToggleCompletion}
                    />
                    {group.key === 'completed' && group.items.length > 0 && (
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
        message={`「${deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeletingItem(undefined)}
      />

      <DeleteConfirmDialog
        open={isDeletingCompletedDialogOpen}
        message={`完了済みのやりたいこと（${
          groupedItems.find((g) => g.key === 'completed')?.items.length ?? 0
        }件）をすべて削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteCompletedItems}
        onCancel={() => setIsDeletingCompletedDialogOpen(false)}
      />
      </div>
    </MainLayout>
  )
}
