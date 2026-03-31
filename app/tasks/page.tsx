'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFocusShortcut } from '@/features/focus'
import { Trash2, Calendar, Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { useCrossGroupDnd } from '@/hooks/useCrossGroupDnd'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { DragOverlayPreview } from '@/components/ui/drag-overlay-preview'
import {
  TaskList,
  TaskDialog,
  RecurringTaskDeleteDialog,
  useTasks,
  groupTasks,
  toTasksWithNextOccurrenceOnly,
  getNextOccurrenceAfter,
  getNextOccurrenceDate,
} from '@/features/tasks'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import { getTodayDateString, getTomorrowDateString } from '@/lib/date/formats'
import { parseISO } from 'date-fns'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/features/tasks'

export default function TasksPage() {
  const router = useRouter()
  useFocusShortcut({ path: '/focus' })
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    deleteCompletedTasks,
    updateOverdueTasksToToday,
    reorderTasks,
  } = useTasks()
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
  const [todayStr, setTodayStr] = useState(getTodayDateString())
  const [defaultDate, setDefaultDate] = useState<string | null | undefined>(undefined)

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const newTodayStr = getTodayDateString()
      if (newTodayStr !== todayStr) {
        setTodayStr(newTodayStr)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [todayStr])

  const tasksWithNextOnly = useMemo(() => {
    const today = new Date()
    return toTasksWithNextOccurrenceOnly(tasks, today)
  }, [tasks])

  const groupedTasks = useMemo(
    () => groupTasks(tasksWithNextOnly),
    [tasksWithNextOnly],
  )

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
    allItems: tasksWithNextOnly,
    reorderItems: reorderTasks,
    updateDate: async (id, executionDate) => {
      await execute(
        () => updateTask(id, { executionDate }),
        'タスクの移動に失敗しました',
      )
    },
  })

  const handleCreateTask = async (input: CreateTaskInput) => {
    const result = await execute(
      () => createTask(input),
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
    if (key === 'today' || key === 'overdue') return todayStr
    if (key === 'tomorrow') return getTomorrowDateString()
    if (key === 'none') return null
    if (key === 'completed') return todayStr
    return key
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    const updateInput: UpdateTaskInput = {
      title: input.title,
      executionDate: input.executionDate,
      scheduledTime: input.scheduledTime,
      recurrenceRule: input.recurrenceRule,
      recurrenceDaysOfWeek: input.recurrenceDaysOfWeek,
      recurrenceDayOfMonth: input.recurrenceDayOfMonth,
      recurrenceEndDate: input.recurrenceEndDate,
    }
    const result = await execute(
      () => updateTask(editingTask.id, updateInput),
      'タスクの更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteTask = async (mode?: 'single' | 'all') => {
    const taskToDelete = deleteConfirm.deletingItem
    if (!taskToDelete) return

    const result = await execute(async () => {
      if (taskToDelete.recurrenceRule && mode === 'single' && taskToDelete.executionDate) {
        const currentExcludedDates = taskToDelete.recurrenceExcludedDates || []
        if (!currentExcludedDates.includes(taskToDelete.executionDate)) {
          await updateTask(taskToDelete.id, {
            recurrenceExcludedDates: [...currentExcludedDates, taskToDelete.executionDate],
          })
        }
      } else {
        await deleteTask(taskToDelete.id)
      }
      return true
    }, 'タスクの削除に失敗しました')
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleCompletion = async (task: Task) => {
    await execute(async () => {
      if (task.recurrenceRule && task.executionDate) {
        // 元タスクのデータを取得（仮想エントリではなくDBの値）
        const originalTask = tasks.find((t) => t.id === task.id)
        if (!originalTask) return

        if (!task.completed) {
          // 完了にする: executionDate を completedDates に追加し、次の日付に進める
          const newCompletedDates = [
            ...(originalTask.recurrenceCompletedDates || []),
            task.executionDate,
          ]
          const nextDate = getNextOccurrenceAfter(
            { ...originalTask, recurrenceCompletedDates: newCompletedDates },
            parseISO(task.executionDate),
          )
          await updateTask(task.id, {
            ...(nextDate ? { executionDate: nextDate } : {}),
            recurrenceCompletedDates: newCompletedDates,
            completed: false,
          })
        } else {
          // 未完了に戻す: executionDate を completedDates から除去
          const newCompletedDates = (originalTask.recurrenceCompletedDates || [])
            .filter((d) => d !== task.executionDate)
          // 戻す日付が元の executionDate より前なら、executionDate を戻す
          const shouldRollback =
            originalTask.executionDate &&
            task.executionDate! < originalTask.executionDate
          await updateTask(task.id, {
            ...(shouldRollback ? { executionDate: task.executionDate } : {}),
            recurrenceCompletedDates: newCompletedDates,
            completed: false,
          })
        }
        return
      }
      await toggleTaskCompletion(task.id, !task.completed)
    }, 'タスクの完了状態の更新に失敗しました')
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
  ) => {
    await execute(
      () => updateTask(task.id, { executionDate }),
      'タスクの実行日の更新に失敗しました',
    )
  }

  const handleDeleteCompletedTasksClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedTasks = async () => {
    const result = await execute(
      () => deleteCompletedTasks(),
      '完了済みタスクの削除に失敗しました',
    )
    if (result !== undefined) {
      setIsDeletingCompletedDialogOpen(false)
    }
  }

  const handleUpdateOverdueTasksToToday = async () => {
    await execute(async () => {
      const overdueGroup = groupedTasks.find((g) => g.key === 'overdue')
      if (!overdueGroup || overdueGroup.tasks.length === 0) {
        throw new Error('更新する期限切れタスクがありませんでした')
      }

      const today = getTodayDateString()
      const todayDate = new Date()
      let updatedCount = 0

      for (const displayTask of overdueGroup.tasks) {
        const originalTask = tasks.find((t) => t.id === displayTask.id)
        if (!originalTask) continue

        if (originalTask.recurrenceRule) {
          const nextOccurrence = getNextOccurrenceDate(originalTask, todayDate)
          if (nextOccurrence) {
            await updateTask(originalTask.id, {
              executionDate: nextOccurrence,
            })
            updatedCount++
          }
        } else {
          await updateTask(originalTask.id, {
            executionDate: today,
          })
          updatedCount++
        }
      }

      if (updatedCount === 0) {
        throw new Error('更新する期限切れタスクがありませんでした')
      }
      return updatedCount
    }, '期限切れタスクの更新に失敗しました')
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">タスク</h1>
            </div>
            <CreateButton label="タスクを作成" onClick={handleCreateClick} />
          </div>
        </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
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
        defaultExecutionDate={defaultDate !== undefined ? defaultDate : undefined}
      />

      {deleteConfirm.deletingItem?.recurrenceRule ? (
        <RecurringTaskDeleteDialog
          open={!!deleteConfirm.deletingItem}
          taskTitle={deleteConfirm.deletingItem.title}
          onConfirm={handleDeleteTask}
          onCancel={deleteConfirm.handleDeleteCancel}
        />
      ) : (
        <DeleteConfirmDialog
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={() => handleDeleteTask()}
          onCancel={deleteConfirm.handleDeleteCancel}
        />
      )}

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
            onClick: () => router.push('/focus'),
          },
        ]}
      />
      </div>
    </>
  )
}
