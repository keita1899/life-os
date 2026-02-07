'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Calendar, Focus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { RecurringTaskDeleteDialog } from '@/components/tasks/RecurringTaskDeleteDialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import { useTasks } from '@/hooks/useTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { groupTasks } from '@/lib/tasks/grouping'
import {
  toTasksWithNextOccurrenceOnly,
  getNextOccurrenceAfter,
  getNextOccurrenceDate,
} from '@/lib/tasks'
import { getTodayDateString } from '@/lib/date/formats'
import { parseISO } from 'date-fns'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/lib/types/task'

export default function TasksPage() {
  const { mode } = useMode()
  const router = useRouter()
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
  } = useTasks()
  const {
    isDialogOpen,
    editingItem: editingTask,
    handleEdit: handleEditTask,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<Task>()
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [todayStr, setTodayStr] = useState(getTodayDateString())

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

  if (mode !== 'life') {
    return null
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      setOperationError(null)
      await createTask(input)
      handleDialogClose(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
      )
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    try {
      setOperationError(null)
      const updateInput: UpdateTaskInput = {
        title: input.title,
        executionDate: input.executionDate,
        scheduledTime: input.scheduledTime,
        recurrenceRule: input.recurrenceRule,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek,
        recurrenceDayOfMonth: input.recurrenceDayOfMonth,
        recurrenceEndDate: input.recurrenceEndDate,
      }
      await updateTask(editingTask.id, updateInput)
      handleDialogClose(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの更新に失敗しました',
      )
    }
  }

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  const handleDeleteTask = async (mode?: 'single' | 'all') => {
    if (!deletingTask) return

    try {
      setOperationError(null)
      if (deletingTask.recurrenceRule && mode === 'single' && deletingTask.executionDate) {
        const currentExcludedDates = deletingTask.recurrenceExcludedDates || []
        if (!currentExcludedDates.includes(deletingTask.executionDate)) {
          await updateTask(deletingTask.id, {
            recurrenceExcludedDates: [...currentExcludedDates, deletingTask.executionDate],
          })
        }
      } else {
        await deleteTask(deletingTask.id)
      }
      setDeletingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task)
  }

  const handleToggleCompletion = async (task: Task) => {
    try {
      setOperationError(null)
      if (
        task.recurrenceRule &&
        !task.completed &&
        task.executionDate
      ) {
        const nextDate = getNextOccurrenceAfter(
          task,
          parseISO(task.executionDate),
        )
        if (nextDate !== null) {
          await updateTask(task.id, {
            executionDate: nextDate,
            completed: false,
          })
          return
        }
      }
      await toggleTaskCompletion(task.id, !task.completed)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'タスクの完了状態の更新に失敗しました',
      )
    }
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ) => {
    try {
      setOperationError(null)
      await updateTask(task.id, { executionDate })
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの実行日の更新に失敗しました',
      )
    }
  }

  const handleDeleteCompletedTasksClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedTasks = async () => {
    try {
      setOperationError(null)
      await deleteCompletedTasks()
      setIsDeletingCompletedDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '完了済みタスクの削除に失敗しました',
      )
    }
  }

  const handleUpdateOverdueTasksToToday = async () => {
    try {
      setOperationError(null)
      const overdueGroup = groupedTasks.find((g) => g.key === 'overdue')
      if (!overdueGroup || overdueGroup.tasks.length === 0) {
        setOperationError('更新する期限切れタスクがありませんでした')
        return
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
        setOperationError('更新する期限切れタスクがありませんでした')
      }
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '期限切れタスクの更新に失敗しました',
      )
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">タスク</h1>
            </div>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              タスクを作成
            </Button>
          </div>
        </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={visibleGroups.map((group) => group.key)}
        >
          {visibleGroups.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionHeader>
                <AccordionTrigger className="hover:no-underline">
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
                    {group.key === 'overdue' && group.tasks.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateOverdueTasksToToday()
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        今日に戻す
                      </Button>
                    )}
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <div className="space-y-4">
                  <TaskList
                    tasks={group.tasks}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteClick}
                    onToggleCompletion={handleToggleCompletion}
                    onUpdateExecutionDate={handleUpdateExecutionDate}
                  />
                  {group.key === 'completed' && group.tasks.length > 0 && (
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
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />

      {deletingTask?.recurrenceRule ? (
        <RecurringTaskDeleteDialog
          open={!!deletingTask}
          taskTitle={deletingTask.title}
          onConfirm={handleDeleteTask}
          onCancel={() => setDeletingTask(undefined)}
        />
      ) : (
        <DeleteConfirmDialog
          open={!!deletingTask}
          message={`「${deletingTask?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={() => handleDeleteTask()}
          onCancel={() => setDeletingTask(undefined)}
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
    </MainLayout>
  )
}
