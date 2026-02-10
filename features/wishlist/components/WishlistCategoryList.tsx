'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { cn } from '@/lib/utils'
import type { WishlistCategory } from '../types/wishlist-category'
import { WishlistCategoryEditForm } from './WishlistCategoryEditForm'

interface WishlistCategoryListProps {
  categories: WishlistCategory[]
  selectedCategoryId: string
  editState: ReturnType<typeof import('@/hooks/useEditState').useEditState>
  onSelectCategory: (categoryId: string) => void
  onDelete: (category: WishlistCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
}

export function WishlistCategoryList({
  categories,
  selectedCategoryId,
  editState,
  onSelectCategory,
  onDelete,
  onUpdateCategory,
}: WishlistCategoryListProps) {
  const deleteConfirm = useDeleteConfirm<WishlistCategory>()

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.deletingItem) return
    await onDelete(deleteConfirm.deletingItem)
    deleteConfirm.clearDeletingItem()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectCategory('all')}
            className={cn(
              'w-full rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'all' && 'bg-stone-800 font-medium',
            )}
          >
            すべて
          </button>
          <button
            onClick={() => onSelectCategory('none')}
            className={cn(
              'w-full rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'none' && 'bg-stone-800 font-medium',
            )}
          >
            未分類
          </button>
        </div>

        <div className="space-y-0.5">
          <p className="px-2 py-1 text-xs font-medium text-stone-400">
            カテゴリー
          </p>
          {categories.map((category) => (
            <div
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!editState.isEditing(category.id)) {
                  onSelectCategory(category.id.toString())
                }
              }}
              onKeyDown={(e) => {
                if (editState.isEditing(category.id)) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectCategory(category.id.toString())
                }
              }}
              className={cn(
                'group flex items-center gap-2 rounded-md py-2 px-2 text-sm transition-colors hover:bg-stone-800 cursor-pointer',
                selectedCategoryId === category.id.toString() &&
                  'bg-stone-800 font-medium',
              )}
            >
              {editState.isEditing(category.id) ? (
                <WishlistCategoryEditForm
                  category={category}
                  onSubmit={(name) => onUpdateCategory(category.id, name)}
                  onCancel={editState.cancelEdit}
                />
              ) : (
                <>
                  <div className="min-w-0 flex-1 truncate text-left">
                    {category.name}
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        editState.startEdit(category.id)
                      }}
                      className="h-7 w-7"
                      aria-label="編集"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConfirm.handleDeleteClick(category)
                      }}
                      className="h-7 w-7"
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
        open={deleteConfirm.deletingItem !== undefined}
        onCancel={deleteConfirm.handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={`「${deleteConfirm.deletingItem?.name}」を削除しますか？`}
      />
    </>
  )
}
