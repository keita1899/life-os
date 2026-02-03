'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { cn } from '@/lib/utils'
import type { VisionCategory } from '@/lib/types/vision-category'
import { VisionCategoryEditForm } from './VisionCategoryEditForm'

interface VisionCategoryListProps {
  categories: VisionCategory[]
  selectedCategoryId: number | 'all' | null
  editingCategoryId: number | null
  onSelectCategory: (categoryId: number | 'all' | null) => void
  onStartEdit: (category: VisionCategory) => void
  onDelete: (category: VisionCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
  onCancelEdit: () => void
}

export function VisionCategoryList({
  categories,
  selectedCategoryId,
  editingCategoryId,
  onSelectCategory,
  onStartEdit,
  onDelete,
  onUpdateCategory,
  onCancelEdit,
}: VisionCategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<
    VisionCategory | undefined
  >(undefined)

  const handleDeleteClick = (category: VisionCategory) => {
    setDeletingCategory(category)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    await onDelete(deletingCategory)
    setDeletingCategory(undefined)
  }

  return (
    <>
      <div className="space-y-0.5">
        <button
          onClick={() => onSelectCategory('all')}
          className={cn(
            'w-full rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
            selectedCategoryId === 'all' &&
              'bg-accent text-accent-foreground font-medium',
          )}
        >
          すべて
        </button>

        {categories.map((category) => (
          <div
            key={category.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (editingCategoryId !== category.id) {
                onSelectCategory(category.id)
              }
            }}
            onKeyDown={(e) => {
              if (editingCategoryId === category.id) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectCategory(category.id)
              }
            }}
            className={cn(
              'group flex items-center gap-2 rounded-md py-2 px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
              selectedCategoryId === category.id &&
                'bg-accent text-accent-foreground font-medium',
            )}
          >
            {editingCategoryId === category.id ? (
              <VisionCategoryEditForm
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

      <DeleteConfirmDialog
        open={deletingCategory !== undefined}
        onCancel={() => setDeletingCategory(undefined)}
        onConfirm={handleDeleteConfirm}
        message={`「${deletingCategory?.name}」を削除しますか？`}
      />
    </>
  )
}
