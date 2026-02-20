'use client'

import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { cn } from '@/lib/utils'
import type { BucketListCategory } from '../types/bucket-list-category'
import { BucketListCategoryEditForm } from './BucketListCategoryEditForm'

export interface BucketListCategoryCounts {
  all: number
  none: number
  achieved: number
  byCategoryId: Record<number, number>
}

interface BucketListCategoryListProps {
  categories: BucketListCategory[]
  selectedCategoryId: string
  editState: ReturnType<typeof import('@/hooks/useEditState').useEditState>
  onSelectCategory: (categoryId: string) => void
  onDelete: (category: BucketListCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
  counts?: BucketListCategoryCounts
}

export function BucketListCategoryList({
  categories,
  selectedCategoryId,
  editState,
  onSelectCategory,
  onDelete,
  onUpdateCategory,
  counts,
}: BucketListCategoryListProps) {
  const deleteConfirm = useDeleteConfirm<BucketListCategory>()

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
            <span className="flex items-center gap-2 w-full">
              <span className="min-w-0 flex-1 flex items-center justify-between gap-2">
                <span>すべて</span>
                {counts && (
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {counts.all}
                  </span>
                )}
              </span>
              <span className="h-8 w-8 shrink-0" aria-hidden />
            </span>
          </button>
          <button
            onClick={() => onSelectCategory('none')}
            className={cn(
              'w-full rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'none' && 'bg-stone-800 font-medium',
            )}
          >
            <span className="flex items-center gap-2 w-full">
              <span className="min-w-0 flex-1 flex items-center justify-between gap-2">
                <span>未分類</span>
                {counts && (
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {counts.none}
                  </span>
                )}
              </span>
              <span className="h-8 w-8 shrink-0" aria-hidden />
            </span>
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
                <BucketListCategoryEditForm
                  category={category}
                  onSubmit={(name) => onUpdateCategory(category.id, name)}
                  onCancel={editState.cancelEdit}
                />
              ) : (
                <>
                  <div className="min-w-0 flex-1 truncate text-left flex items-center justify-between gap-2">
                    <span>{category.name}</span>
                    {counts && (
                      <span className="shrink-0 text-muted-foreground tabular-nums">
                        {counts.byCategoryId[category.id] ?? 0}
                      </span>
                    )}
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

        <div className="space-y-0.5 border-t border-stone-200 pt-4 dark:border-stone-800">
          <button
            onClick={() => onSelectCategory('achieved')}
            className={cn(
              'w-full rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'achieved' && 'bg-stone-800 font-medium',
            )}
          >
            <span className="flex items-center gap-2 w-full">
              <span className="min-w-0 flex-1 flex items-center justify-between gap-2">
                <span>達成リスト</span>
                {counts && (
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {counts.achieved}
                  </span>
                )}
              </span>
              <span className="h-8 w-8 shrink-0" aria-hidden />
            </span>
          </button>
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
