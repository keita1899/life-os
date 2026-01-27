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
      <div className="space-y-1">
        <button
          onClick={() => onSelectCategory('all')}
          className={cn(
            'w-full rounded-lg border border-stone-200 bg-card p-3 text-left transition-colors hover:bg-accent dark:border-stone-800',
            selectedCategoryId === 'all' &&
              'bg-accent text-accent-foreground',
          )}
        >
          すべて
        </button>

        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'group flex items-center gap-2 rounded-lg border border-stone-200 bg-card p-3 transition-colors hover:bg-accent dark:border-stone-800',
              selectedCategoryId === category.id &&
                'bg-accent text-accent-foreground',
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
                <button
                  onClick={() => onSelectCategory(category.id)}
                  className="flex-1 text-left"
                >
                  {category.name}
                </button>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStartEdit(category)}
                    className="h-8 w-8"
                    aria-label="編集"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(category)}
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

      <DeleteConfirmDialog
        open={deletingCategory !== undefined}
        onCancel={() => setDeletingCategory(undefined)}
        onConfirm={handleDeleteConfirm}
        message={`「${deletingCategory?.name}」を削除しますか？`}
      />
    </>
  )
}
