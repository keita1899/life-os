'use client'

import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { cn } from '@/lib/utils'
import type { VisionCategory } from '../types/vision-category'
import { VisionCategoryEditForm } from './VisionCategoryEditForm'

interface VisionCategoryListProps {
  categories: VisionCategory[]
  selectedCategoryId: number | 'all' | null
  editState: ReturnType<typeof import('@/hooks/useEditState').useEditState>
  onSelectCategory: (categoryId: number | 'all' | null) => void
  onDelete: (category: VisionCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
}

export function VisionCategoryList({
  categories,
  selectedCategoryId,
  editState,
  onSelectCategory,
  onDelete,
  onUpdateCategory,
}: VisionCategoryListProps) {
  const deleteConfirm = useDeleteConfirm<VisionCategory>()

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.deletingItem) return
    await onDelete(deleteConfirm.deletingItem)
    deleteConfirm.clearDeletingItem()
  }

  return (
    <>
      <div className="space-y-0.5">
        <button
          onClick={() => onSelectCategory('all')}
          className={cn(
            'flex w-full items-center gap-2 rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
            selectedCategoryId === 'all' && 'bg-stone-800 font-medium',
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">すべて</span>
          <span className="h-8 w-8 shrink-0" aria-hidden />
        </button>

        {categories.map((category) => (
          <div
            key={category.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!editState.isEditing(category.id)) {
                onSelectCategory(category.id)
              }
            }}
            onKeyDown={(e) => {
              if (editState.isEditing(category.id)) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectCategory(category.id)
              }
            }}
            className={cn(
              'group flex items-center gap-2 rounded-md py-2 px-2 text-sm transition-colors hover:bg-stone-800 cursor-pointer',
              selectedCategoryId === category.id &&
                'bg-stone-800 font-medium',
            )}
          >
            {editState.isEditing(category.id) ? (
              <VisionCategoryEditForm
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
                  className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditDeleteDropdownMenu
                    onEdit={() => editState.startEdit(category.id)}
                    onDelete={() => deleteConfirm.handleDeleteClick(category)}
                  />
                </div>
              </>
            )}
          </div>
        ))}
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
