'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFocusShortcut } from '@/features/focus'
import { Trash2, Calendar, Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateButton } from '@/components/ui/create-button'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { useCrossGroupDnd } from '@/hooks/useCrossGroupDnd'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { DragOverlayPreview } from '@/components/ui/drag-overlay-preview'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList, TaskDialog, groupTasks } from '@/features/tasks'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import { useDevTasks } from '@/features/dev/tasks'
import { getTodayDateString, getTomorrowDateString } from '@/lib/date/formats'
import type { Task, CreateTaskInput } from '@/features/tasks'

export default function DevTasksPage() {
  const router = useRouter()
  useFocusShortcut({ path: '/dev/focus?source=tasks' })

  const [activeType, setActiveType] = useState<'inbox' | 'learning'>('inbox')

  const {
    tasks,
    isLoading: isTasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    deleteCompletedTasks,
    updateOverdueTasksToToday,
    reorderTasks,
  } = useDevTasks({
    projectId: null,
    type: activeType,
  })

  const {
    isDialogOpen,
    editingItem: editingTask,
    handleEdit: handleEditTask,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<Task>()
  const deleteConfirm = useDeleteConfirm<Task>()
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [defaultDate, setDefaultDate] = useState<string | null | undefined>(undefined)

  const convertedTasks: Task[] = useMemo(() => {
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      executionDate: t.executionDate,
      completed: t.completed,
      order: t.order,
      scheduledTime: null,
      recurrenceRule: null,
      recurrenceDaysOfWeek: null,
      recurrenceDayOfMonth: null,
      recurrenceEndDate: null,
      recurrenceExcludedDates: [],
      memo: t.memo,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }))
  }, [tasks])

  const groupedTasks = useMemo(() => groupTasks(convertedTasks), [convertedTasks])

  const visibleGroups = useMemo(
    () =>
      groupedTasks.filter(
        (group) => group.key === 'today' || group.tasks.length > 0,
      ),
    [groupedTasks],
  )

  const groupKeys = useMemo(() => visibleGroups.map((g) => g.key), [visibleGroups])
  const { openKeys: openAccordionKeys, setOpenKeys: setOpenAccordionKeys } =
    useAutoExpandAccordion(groupKeys)

  const dndGroups = useMemo(
    () => visibleGroups.map((g) => ({ key: g.key, items: g.tasks })),
    [visibleGroups],
  )

  const crossGroupDnd = useCrossGroupDnd({
    visibleGroups: dndGroups,
    allItems: convertedTasks,
    reorderItems: reorderTasks,
    updateDate: async (id, executionDate) => {
      await execute(
        () => updateTask(id, { executionDate }),
        'タスクの移動に失敗しました',
      )
    },
  })

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  const handleTypeChange = (value: string) => {
    if (value !== 'inbox' && value !== 'learning') return
    setActiveType(value)
    handleDialogClose(false)
  }

  const handleCreateTask = async (input: CreateTaskInput): Promise<void> => {
    const result = await execute(
      () =>
        createTask({
          title: input.title,
          projectId: null,
          type: activeType,
          executionDate: input.executionDate,
          memo: input.memo,
        }),
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
      setDefaultDate(undefined)
    }
  }

  const handleInlineCreate = (date: string | null) => {
    setDefaultDate(date)
    handleCreateClick()
  }

  const getGroupDate = (key: string): string | null => {
    const todayStr = getTodayDateString()
    if (key === 'today' || key === 'overdue') return todayStr
    if (key === 'tomorrow') return getTomorrowDateString()
    if (key === 'none') return null
    if (key === 'completed') return todayStr
    return key
  }

  const handleUpdateTask = async (input: CreateTaskInput): Promise<void> => {
    if (!editingTask) return

    const result = await execute(
      () =>
        updateTask(editingTask.id, {
          title: input.title,
          executionDate: input.executionDate,
          memo: input.memo,
        }),
      'タスクの更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteTask = async (): Promise<void> => {
    const task = deleteConfirm.deletingItem
    if (!task) return

    const result = await execute(
      () => deleteTask(task.id),
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleCompletion = async (task: Task): Promise<void> => {
    await execute(
      () => toggleTaskCompletion(task.id, !task.completed),
      'タスクの完了状態の更新に失敗しました',
    )
  }

  const handleRenameTask = async (task: Task, title: string) => {
    await execute(
      () => updateTask(task.id, { title }),
      'タスク名の更新に失敗しました',
    )
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ): Promise<void> => {
    await execute(
      () => updateTask(task.id, { executionDate }),
      'タスクの実行日の更新に失敗しました',
    )
  }

  const handleDeleteCompletedTasksClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedTasks = async (): Promise<void> => {
    const result = await execute(
      () => deleteCompletedTasks(),
      '完了済みタスクの削除に失敗しました',
    )
    if (result !== undefined) {
      setIsDeletingCompletedDialogOpen(false)
    }
  }

  const handleUpdateOverdueTasksToToday = async (): Promise<void> => {
    await execute(
      () => updateOverdueTasksToToday(),
      '期限切れタスクの更新に失敗しました',
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">タスク</h1>
            </div>
            <CreateButton label="タスクを作成" onClick={handleCreateClick} />
          </div>

          <Tabs value={activeType} onValueChange={handleTypeChange}>
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="learning">学習</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ErrorMessage
          message={operationError || tasksError || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        {isTasksLoading ? (
          <Loading />
        ) : (
          <DndContext
            sensors={crossGroupDnd.sensors}
            collisionDetection={closestCenter}
            onDragStart={crossGroupDnd.handleDragStart}
            onDragOver={crossGroupDnd.handleDragOver}
            onDragEnd={crossGroupDnd.handleDragEnd}
            onDragCancel={crossGroupDnd.handleDragCancel}
          >
            <GroupedAccordion
              value={openAccordionKeys}
              onValueChange={setOpenAccordionKeys}
              items={visibleGroups.map((group) => {
                const isCompleted = group.key === 'completed'
                return {
                  key: group.key,
                  trigger: (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                          {group.title}
                        </h2>
                        {group.tasks.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {group.tasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                  content: (
                    <div className="space-y-4">
                      <TaskList
                        tasks={group.tasks}
                        onEdit={handleEditTask}
                        onDelete={deleteConfirm.handleDeleteClick}
                        onToggleCompletion={handleToggleCompletion}
                        onUpdateExecutionDate={handleUpdateExecutionDate}
                        onRename={handleRenameTask}
                        onReorder={reorderTasks}
                        groupKey={isCompleted ? undefined : group.key}
                        isDropTarget={!isCompleted && crossGroupDnd.isDropTarget(group.key)}
                        insertBeforeId={!isCompleted && crossGroupDnd.isDropTarget(group.key) ? crossGroupDnd.insertBeforeId : undefined}
                      />
                      {group.key === 'overdue' && group.tasks.length > 0 && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void handleUpdateOverdueTasksToToday()
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            今日に戻す
                          </Button>
                        </div>
                      )}
                      {isCompleted && group.tasks.length > 0 && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDeleteCompletedTasksClick}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            完了済みを一括削除
                          </Button>
                        </div>
                      )}
                      {!isCompleted && group.key !== 'overdue' && (
                        <InlineCreateButton
                          label="タスクを追加"
                          onClick={() => handleInlineCreate(getGroupDate(group.key))}
                        />
                      )}
                    </div>
                  ),
                }
              })}
            />
            <DragOverlayPreview activeItem={crossGroupDnd.activeTask} />
          </DndContext>
        )}

        <TaskDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            handleDialogClose(open)
            if (!open) setDefaultDate(undefined)
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
          defaultExecutionDate={defaultDate !== undefined ? (defaultDate ?? undefined) : undefined}
        />

        <DeleteConfirmDialog
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteTask}
          onCancel={deleteConfirm.handleDeleteCancel}
        />

        <DeleteConfirmDialog
          open={isDeletingCompletedDialogOpen}
          message={`完了済みのタスク（${
            groupedTasks.find((g) => g.key === 'completed')?.tasks.length ?? 0
          }件）をすべて削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteCompletedTasks}
          onCancel={() => setIsDeletingCompletedDialogOpen(false)}
        />

        <FloatingActionButtons
          actions={[
            {
              id: 'focus',
              label: 'フォーカスモード',
              icon: <Focus className="h-5 w-5" />,
              onClick: () => router.push('/dev/focus?source=tasks'),
            },
          ]}
        />
      </div>
    </>
  )
}

