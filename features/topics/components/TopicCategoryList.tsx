'use client'

import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { InlineCategoryCreateItem } from '@/components/ui/inline-category-create-item'
import { SortableCategoryItem } from '@/components/ui/sortable-category-item'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { cn } from '@/lib/utils'
import type { TopicCategory } from '../types/topic-category'
import { TopicCategoryEditForm } from './TopicCategoryEditForm'

interface TopicCategoryListProps {
  categories: TopicCategory[]
  selectedCategoryId: number | 'all' | 'none' | null
  editState: ReturnType<typeof import('@/hooks/useEditState').useEditState>
  onSelectCategory: (categoryId: number | 'all' | 'none' | null) => void
  onDelete: (category: TopicCategory) => void
  onUpdateCategory: (id: number, name: string) => Promise<void>
  onCreateCategory: (name: string) => Promise<void>
  onReorder: (updates: { id: number; sortOrder: number }[]) => Promise<void>
}

export function TopicCategoryList({
  categories,
  selectedCategoryId,
  editState,
  onSelectCategory,
  onDelete,
  onUpdateCategory,
  onCreateCategory,
  onReorder,
}: TopicCategoryListProps) {
  const deleteConfirm = useDeleteConfirm<TopicCategory>()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(categories, oldIndex, newIndex)
      const updates = reordered.map((c, i) => ({ id: c.id, sortOrder: i }))
      onReorder(updates)
    },
    [categories, onReorder],
  )

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
              'flex w-full items-center gap-2 rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'all' && 'bg-stone-800 font-medium',
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">すべて</span>
            <span className="h-8 w-8 shrink-0" aria-hidden />
          </button>
          <button
            onClick={() => onSelectCategory('none')}
            className={cn(
              'flex w-full items-center gap-2 rounded-md py-2 px-2 text-left text-sm transition-colors hover:bg-stone-800',
              selectedCategoryId === 'none' && 'bg-stone-800 font-medium',
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">未分類</span>
            <span className="h-8 w-8 shrink-0" aria-hidden />
          </button>
        </div>

        <div className="space-y-0.5">
          <p className="px-2 py-1 text-xs font-medium text-stone-400">
            カテゴリー
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
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
                    'group flex items-center gap-0.5 rounded-md py-2 px-1 text-sm transition-colors hover:bg-stone-800 cursor-pointer',
                    selectedCategoryId === category.id &&
                      'bg-stone-800 font-medium',
                  )}
                >
                  <SortableCategoryItem id={category.id}>
                    {editState.isEditing(category.id) ? (
                      <TopicCategoryEditForm
                        category={category}
                        onSubmit={(name) => onUpdateCategory(category.id, name)}
                        onCancel={editState.cancelEdit}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
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
                      </div>
                    )}
                  </SortableCategoryItem>
                </div>
              ))}
            </SortableContext>
          </DndContext>
          <InlineCategoryCreateItem onSubmit={onCreateCategory} />
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
