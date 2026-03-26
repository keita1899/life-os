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
import type { RoadmapProject } from '../types/roadmap-project'
import { RoadmapProjectEditForm } from './RoadmapProjectEditForm'

interface RoadmapProjectListProps {
  projects: RoadmapProject[]
  selectedProjectId: string
  editState: ReturnType<typeof import('@/hooks/useEditState').useEditState>
  onSelectProject: (projectId: string) => void
  onDelete: (project: RoadmapProject) => void
  onUpdateProject: (id: number, name: string) => Promise<void>
  onCreateProject: (name: string) => Promise<void>
  onReorder: (updates: { id: number; sortOrder: number }[]) => Promise<void>
}

export function RoadmapProjectList({
  projects,
  selectedProjectId,
  editState,
  onSelectProject,
  onDelete,
  onUpdateProject,
  onCreateProject,
  onReorder,
}: RoadmapProjectListProps) {
  const deleteConfirm = useDeleteConfirm<RoadmapProject>()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = projects.findIndex((p) => p.id === active.id)
      const newIndex = projects.findIndex((p) => p.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(projects, oldIndex, newIndex)
      const updates = reordered.map((p, i) => ({ id: p.id, sortOrder: i }))
      onReorder(updates)
    },
    [projects, onReorder],
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!editState.isEditing(project.id)) {
                      onSelectProject(project.id.toString())
                    }
                  }}
                  onDoubleClick={() => editState.startEdit(project.id)}
                  onKeyDown={(e) => {
                    if (editState.isEditing(project.id)) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectProject(project.id.toString())
                    }
                  }}
                  className={cn(
                    'group flex items-center gap-0.5 rounded-md py-2 px-1 text-sm transition-colors hover:bg-stone-800 cursor-pointer',
                    selectedProjectId === project.id.toString() &&
                      'bg-stone-800 font-medium',
                  )}
                >
                  <SortableCategoryItem id={project.id}>
                    {editState.isEditing(project.id) ? (
                      <RoadmapProjectEditForm
                        project={project}
                        onSubmit={(name) => onUpdateProject(project.id, name)}
                        onCancel={editState.cancelEdit}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1 truncate text-left">
                          <span>{project.name}</span>
                        </div>
                        <div
                          className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EditDeleteDropdownMenu
                            onEdit={() => editState.startEdit(project.id)}
                            onDelete={() => deleteConfirm.handleDeleteClick(project)}
                          />
                        </div>
                      </div>
                    )}
                  </SortableCategoryItem>
                </div>
              ))}
            </SortableContext>
          </DndContext>
          <InlineCategoryCreateItem onSubmit={onCreateProject} label="プロジェクトを追加" placeholder="プロジェクト名" />
        </div>

      </div>

      <DeleteConfirmDialog
        open={deleteConfirm.deletingItem !== undefined}
        onCancel={deleteConfirm.handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={`「${deleteConfirm.deletingItem?.name}」を削除しますか？プロジェクト内のセクション・タスクもすべて削除されます。`}
      />
    </>
  )
}
