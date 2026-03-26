'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { CreateButton } from '@/components/ui/create-button'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { SortableCategoryItem } from '@/components/ui/sortable-category-item'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { useRoadmapSections } from '../hooks/useRoadmapSections'
import { useRoadmapTasks } from '../hooks/useRoadmapTasks'
import { RoadmapSectionHeader } from './RoadmapSectionHeader'
import { RoadmapTaskList } from './RoadmapTaskList'
import { RoadmapTaskDialog } from './RoadmapTaskDialog'
import { RoadmapTaskItem } from './RoadmapTaskItem'
import type { RoadmapTask, CreateRoadmapTaskInput, UpdateRoadmapTaskInput } from '../types/roadmap-task'
import type { RoadmapSection, RoadmapSectionStatus } from '../types/roadmap-section'


// --- 年月グルーピング ---

interface YearMonthGroup {
  key: string
  label: string
  targetYear: number | null
  targetMonth: number | null
  tasks: RoadmapTask[]
}

function groupTasksByYearMonth(tasks: RoadmapTask[]): YearMonthGroup[] {
  const map = new Map<string, RoadmapTask[]>()

  for (const task of tasks) {
    let key: string
    if (task.targetYear != null && task.targetMonth != null) {
      key = `${task.targetYear}-${task.targetMonth}`
    } else if (task.targetYear != null) {
      key = `${task.targetYear}-0`
    } else {
      key = 'unset'
    }
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(task)
  }

  const sorted = [...map.entries()].sort(([a], [b]) => {
    if (a === 'unset') return 1
    if (b === 'unset') return -1
    const [yearA, monthA] = a.split('-').map(Number)
    const [yearB, monthB] = b.split('-').map(Number)
    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  return sorted.map(([key, groupTasks]) => {
    if (key === 'unset') {
      return { key, label: '未定', targetYear: null, targetMonth: null, tasks: groupTasks }
    }
    const [year, month] = key.split('-').map(Number)
    if (month === 0) {
      return { key, label: `${year}年`, targetYear: year, targetMonth: null, tasks: groupTasks }
    }
    return { key, label: `${year}年${month}月`, targetYear: year, targetMonth: month, tasks: groupTasks }
  })
}

// --- セクション追加のインライン入力 ---

function InlineSectionCreate({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!value.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit()
      inputRef.current?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return
          if (e.key === 'Enter') {
            e.preventDefault()
            void handleSubmit()
          }
        }}
        placeholder="+ セクションを追加"
        disabled={isSubmitting}
        className="h-9 flex-1 rounded-md border border-dashed border-stone-300/60 bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-stone-400/80 dark:border-stone-700/50 dark:focus:border-stone-600/70"
      />
      {value.trim() && (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
        >
          追加
        </button>
      )}
    </div>
  )
}

// --- メインコンポーネント ---

interface RoadmapProjectViewProps {
  projectId: number
  projectName: string
}

export function RoadmapProjectView({
  projectId,
  projectName,
}: RoadmapProjectViewProps) {
  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  } = useRoadmapSections(projectId)

  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    reorderTasks,
  } = useRoadmapTasks(projectId)

  const {
    isDialogOpen,
    editingItem,
    handleEdit: handleEditItem,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<RoadmapTask>()

  const deleteConfirm = useDeleteConfirm<RoadmapTask>()
  const deleteSectionConfirm = useDeleteConfirm<RoadmapSection>()
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [createDefaults, setCreateDefaults] = useState<{
    sectionId?: string
    targetYear?: string
    targetMonth?: string
  }>({})
  const [newSectionName, setNewSectionName] = useState('')

  const isLoading = sectionsLoading || tasksLoading
  const error = sectionsError || tasksError

  // セクション開閉（進行中のみデフォルトで開く）
  const ensureSectionsOpen = useCallback((sectionList: RoadmapSection[]) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      for (const s of sectionList) {
        if (s.status === 'in_progress') {
          next.add(`section-${s.id}`)
        }
      }
      return next
    })
  }, [])

  useMemo(() => {
    if (sections.length > 0) {
      ensureSectionsOpen(sections)
    }
  }, [sections, ensureSectionsOpen])

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // タスクをセクション別に分類
  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks])
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks])

  const tasksBySection = useMemo(() => {
    const map: Record<number, RoadmapTask[]> = {}
    for (const section of sections) {
      map[section.id] = incompleteTasks.filter((t) => t.sectionId === section.id)
    }
    return map
  }, [sections, incompleteTasks])

  // セクション並び替え DnD
  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleSectionDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(sections, oldIndex, newIndex)
      const updates = reordered.map((s, i) => ({ id: s.id, sortOrder: i }))
      void reorderSections(updates)
    },
    [sections, reorderSections],
  )

  // タスク CRUD
  const handleCreateTask = async (input: CreateRoadmapTaskInput) => {
    const result = await execute(
      () => createTask(input),
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
      setCreateDefaults({})
    }
  }

  const handleUpdateTask = async (input: CreateRoadmapTaskInput) => {
    if (!editingItem) return
    const updateInput: UpdateRoadmapTaskInput = {
      title: input.title,
      sectionId: input.sectionId,
      targetYear: input.targetYear,
      targetMonth: input.targetMonth,
    }
    const result = await execute(
      () => updateTask(editingItem.id, updateInput),
      'タスクの更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteTask = async () => {
    const task = deleteConfirm.deletingItem
    if (!task) return
    const result = await execute(
      async () => {
        await deleteTask(task.id)
        return true
      },
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleCompletion = async (task: RoadmapTask) => {
    await execute(
      () => toggleTaskCompletion(task.id, !task.completed),
      'タスクの完了状態の更新に失敗しました',
    )
  }

  const handleRenameTask = async (task: RoadmapTask, title: string) => {
    await execute(
      () => updateTask(task.id, { title }),
      'タスク名の更新に失敗しました',
    )
  }

  const handleInlineCreate = useCallback(
    (sectionId: string, targetYear?: string, targetMonth?: string) => {
      setCreateDefaults({ sectionId, targetYear, targetMonth })
      handleCreateClick()
    },
    [handleCreateClick],
  )

  // セクション CRUD
  const handleCreateSection = async () => {
    const trimmed = newSectionName.trim()
    if (!trimmed) return
    const result = await execute(
      () => createSection({ name: trimmed, projectId }),
      'セクションの作成に失敗しました',
    )
    if (result !== undefined) {
      setNewSectionName('')
      setOpenSections((prev) => {
        const next = new Set(prev)
        next.add(`section-${result.id}`)
        return next
      })
    }
  }

  const handleUpdateSectionName = async (id: number, name: string) => {
    await execute(
      () => updateSection(id, { name }),
      'セクション名の更新に失敗しました',
    )
  }

  const handleUpdateSectionStatus = async (id: number, status: RoadmapSectionStatus) => {
    await execute(
      () => updateSection(id, { status }),
      'ステータスの更新に失敗しました',
    )
  }

  const handleDeleteSection = async () => {
    const section = deleteSectionConfirm.deletingItem
    if (!section) return
    const result = await execute(
      async () => {
        await deleteSection(section.id)
        return true
      },
      'セクションの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteSectionConfirm.clearDeletingItem()
    }
  }

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  if (isLoading) return <Loading />

  /** セクション内のタスクを年月グループで描画 */
  const renderMonthGroups = (sectionTasks: RoadmapTask[], sectionId: string) => {
    const groups = groupTasksByYearMonth(sectionTasks)

    if (groups.length === 0) {
      return (
        <InlineCreateButton
          label="タスクを追加"
          onClick={() => handleInlineCreate(sectionId)}
        />
      )
    }

    return (
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </div>
            <RoadmapTaskList
              tasks={group.tasks}
              onEdit={handleEditItem}
              onDelete={deleteConfirm.handleDeleteClick}
              onToggleCompletion={handleToggleCompletion}
              onRename={handleRenameTask}
              onReorder={reorderTasks}
            />
            <div className="mt-2">
              <InlineCreateButton
                label="タスクを追加"
                onClick={() =>
                  handleInlineCreate(
                    sectionId,
                    group.targetYear != null ? String(group.targetYear) : undefined,
                    group.targetMonth != null ? String(group.targetMonth) : undefined,
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{projectName}</h1>
        <CreateButton label="タスクを作成" onClick={handleCreateClick} />
      </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      <div className="space-y-6">
        {/* セクション一覧（並び替え可能） */}
        <DndContext
          sensors={sectionSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => {
              const sectionKey = `section-${section.id}`
              const sectionTasks = tasksBySection[section.id] ?? []
              const isDimmed = section.status !== 'in_progress'
              return (
                <div key={section.id} className={isDimmed ? 'opacity-40' : undefined}>
                  <SortableCategoryItem id={section.id}>
                    <RoadmapSectionHeader
                      section={section}
                      isOpen={openSections.has(sectionKey)}
                      taskCount={sectionTasks.length}
                      onToggle={() => toggleSection(sectionKey)}
                      onUpdateName={(name) => handleUpdateSectionName(section.id, name)}
                      onUpdateStatus={(status) => handleUpdateSectionStatus(section.id, status)}
                      onDelete={() => deleteSectionConfirm.handleDeleteClick(section)}
                    />
                  </SortableCategoryItem>
                  {openSections.has(sectionKey) && (
                    <div className="space-y-2">
                      {renderMonthGroups(sectionTasks, section.id.toString())}
                    </div>
                  )}
                </div>
              )
            })}
          </SortableContext>
        </DndContext>

        {/* セクション追加 */}
        <InlineSectionCreate
          value={newSectionName}
          onChange={setNewSectionName}
          onSubmit={handleCreateSection}
        />

        {/* 完了済み */}
        {completedTasks.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => toggleSection('completed')}
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              <span>完了済み</span>
              <span className="text-xs font-normal text-muted-foreground">
                {completedTasks.length}
              </span>
            </button>
            {openSections.has('completed') && (
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <RoadmapTaskItem
                    key={task.id}
                    task={task}
                    onEdit={handleEditItem}
                    onDelete={deleteConfirm.handleDeleteClick}
                    onToggleCompletion={handleToggleCompletion}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <RoadmapTaskDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          handleDialogClose(open)
          if (!open) setCreateDefaults({})
        }}
        onSubmit={editingItem ? handleUpdateTask : handleCreateTask}
        task={editingItem}
        sections={sections}
        projectId={projectId}
        defaultSectionId={
          editingItem == null ? createDefaults.sectionId : undefined
        }
        defaultTargetYear={
          editingItem == null ? createDefaults.targetYear : undefined
        }
        defaultTargetMonth={
          editingItem == null ? createDefaults.targetMonth : undefined
        }
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm.deletingItem}
        message={`「${deleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteTask}
        onCancel={deleteConfirm.handleDeleteCancel}
      />

      <DeleteConfirmDialog
        open={!!deleteSectionConfirm.deletingItem}
        message={`セクション「${deleteSectionConfirm.deletingItem?.name}」を削除しますか？タスクは「セクションなし」に移動されます。`}
        onConfirm={handleDeleteSection}
        onCancel={deleteSectionConfirm.handleDeleteCancel}
      />
    </div>
  )
}
