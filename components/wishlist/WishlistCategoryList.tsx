'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { cn } from '@/lib/utils'
import type { WishlistCategory } from '@/lib/types/wishlist-category'
import { WishlistCategoryEditForm } from './WishlistCategoryEditForm'

interface WishlistCategoryListProps {
  categories: WishlistCategory[]
  selectedCategoryId: string
  editingCategoryId: number | null
  onSelectCategory: (categoryId: string) => void
  onStartEdit: (category: WishlistCategory) => void
  onDelete: (category: WishlistCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
  onCancelEdit: () => void
}

export function WishlistCategoryList({
  categories,
  selectedCategoryId,
  editingCategoryId,
  onSelectCategory,
  onStartEdit,
  onDelete,
  onUpdateCategory,
  onCancelEdit,
}: WishlistCategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<
    WishlistCategory | undefined
  >(undefined)

  const handleDeleteClick = (category: WishlistCategory) => {
    setDeletingCategory(category)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    await onDelete(deletingCategory)
    setDeletingCategory(undefined)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={cn(
              'w-full rounded-lg border border-stone-200 bg-card p-3 text-left transition-colors hover:bg-accent dark:border-stone-800',
              selectedCategoryId === 'all' && 'bg-accent text-accent-foreground',
            )}
          >
            すべて
          </button>
          <button
            onClick={() => onSelectCategory('none')}
            className={cn(
              'w-full rounded-lg border border-stone-200 bg-card p-3 text-left transition-colors hover:bg-accent dark:border-stone-800',
              selectedCategoryId === 'none' && 'bg-accent text-accent-foreground',
            )}
          >
            未分類
          </button>
        </div>

        <div className="space-y-1">
          <p className="px-1 text-xs font-medium text-muted-foreground">
            カテゴリー
          </p>
          {categories.map((category) => (
            <div
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (editingCategoryId !== category.id) {
                  onSelectCategory(category.id.toString())
                }
              }}
              onKeyDown={(e) => {
                if (editingCategoryId === category.id) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectCategory(category.id.toString())
                }
              }}
              className={cn(
                'group flex items-center gap-2 rounded-lg border border-stone-200 bg-card p-3 transition-colors hover:bg-accent cursor-pointer dark:border-stone-800',
                selectedCategoryId === category.id.toString() &&
                  'bg-accent text-accent-foreground',
              )}
            >
              {editingCategoryId === category.id ? (
                <WishlistCategoryEditForm
                  category={category}
                  onSubmit={(name) => onUpdateCategory(category.id, name)}
                  onCancel={onCancelEdit}
                />
              ) : (
                <>
                  <div className="flex-1 text-left">{category.name}</div>
                  <div
                    className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartEdit(category)
                      }}
                      className="h-8 w-8"
                      aria-label="編集"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(category)
                      }}
                      className="h-8 w-8"
                      aria-label="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <DeleteConfirmDialog
        open={deletingCategory !== undefined}
        onCancel={() => setDeletingCategory(undefined)}
        onConfirm={handleDeleteConfirm}
        message={`「${deletingCategory?.name}」を削除しますか？`}
      />
    </>
  )
}
