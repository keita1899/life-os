'use client'

import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useTasks } from '@/hooks/useTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { groupTasks } from '@/lib/tasks/grouping'
import { getTodayDateString } from '@/lib/date/formats'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/lib/types/task'

export default function TasksPage() {
  const { mode } = useMode()
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    deleteCompletedTasks,
  } = useTasks()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const todayStr = getTodayDateString()
  const groupedTasks = useMemo(() => groupTasks(tasks), [tasks, todayStr])

  if (mode !== 'life') {
    return null
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      setOperationError(null)
      await createTask(input)
      setIsDialogOpen(false)
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
        estimatedTime: input.estimatedTime,
      }
      await updateTask(editingTask.id, updateInput)
      setIsDialogOpen(false)
      setEditingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの更新に失敗しました',
      )
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingTask(undefined)
    }
  }

  const handleDeleteTask = async () => {
    if (!deletingTask) return

    try {
      setOperationError(null)
      await deleteTask(deletingTask.id)
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
      await toggleTaskCompletion(task.id, !task.completed)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'タスクの完了状態の更新に失敗しました',
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

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">タスク</h1>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>タスクを作成</Button>
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
          defaultValue={groupedTasks.map((group) => group.key)}
        >
          {groupedTasks.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionHeader>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {group.title}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({group.tasks.length})
                    </span>
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

      <DeleteConfirmDialog
        open={!!deletingTask}
        message={`「${deletingTask?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(undefined)}
      />

      <DeleteConfirmDialog
        open={isDeletingCompletedDialogOpen}
        message={`完了済みのタスク（${
          groupedTasks.find((g) => g.key === 'completed')?.tasks.length ?? 0
        }件）をすべて削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteCompletedTasks}
        onCancel={() => setIsDeletingCompletedDialogOpen(false)}
      />
      </div>
    </MainLayout>
  )
}
