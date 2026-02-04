'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { cn } from '@/lib/utils'
import type { BucketListCategory } from '@/lib/types/bucket-list-category'
import { BucketListCategoryEditForm } from './BucketListCategoryEditForm'

interface BucketListCategoryListProps {
  categories: BucketListCategory[]
  selectedCategoryId: string
  editingCategoryId: number | null
  onSelectCategory: (categoryId: string) => void
  onStartEdit: (category: BucketListCategory) => void
  onDelete: (category: BucketListCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
  onCancelEdit: () => void
}

export function BucketListCategoryList({
  categories,
  selectedCategoryId,
  editingCategoryId,
  onSelectCategory,
  onStartEdit,
  onDelete,
  onUpdateCategory,
  onCancelEdit,
}: BucketListCategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<
    BucketListCategory | undefined
  >(undefined)

  const handleDeleteClick = (category: BucketListCategory) => {
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
                'group flex items-center gap-2 rounded-md py-2 px-2 text-sm transition-colors hover:bg-stone-800 cursor-pointer',
                selectedCategoryId === category.id.toString() &&
                  'bg-stone-800 font-medium',
              )}
            >
              {editingCategoryId === category.id ? (
                <BucketListCategoryEditForm
                  category={category}
                  onSubmit={(name) => onUpdateCategory(category.id, name)}
                  onCancel={onCancelEdit}
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
                        onStartEdit(category)
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
                        handleDeleteClick(category)
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

        <div className="space-y-0.5 border-t border-stone-200 pt-4 dark:border-stone-800">
          <button
            onClick={() => onSelectCategory('achieved')}
            className={cn(
              'w-full rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'achieved' && 'bg-stone-800 font-medium',
            )}
          >
            達成リスト
          </button>
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
