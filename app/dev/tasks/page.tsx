'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
import { groupTasks } from '@/lib/tasks/grouping'
import { useDevTasks } from '@/hooks/useDevTasks'
import type { Task, CreateTaskInput } from '@/lib/types/task'

export default function DevTasksPage() {
  const { mode } = useMode()

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
  } = useDevTasks({
    projectId: null,
    type: activeType,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const groupedTasks = useMemo(() => groupTasks(tasks), [tasks])

  if (mode !== 'development') {
    return null
  }

  const handleTypeChange = (value: string) => {
    if (value !== 'inbox' && value !== 'learning') return
    setActiveType(value)
    setEditingTask(undefined)
    setIsDialogOpen(false)
  }

  const handleCreateTask = async (input: CreateTaskInput): Promise<void> => {
    try {
      setOperationError(null)
      await createTask({
        title: input.title,
        projectId: null,
        type: activeType,
        executionDate: input.executionDate,
      })
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
      )
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput): Promise<void> => {
    if (!editingTask) return

    try {
      setOperationError(null)
      await updateTask(editingTask.id, {
        title: input.title,
        executionDate: input.executionDate,
      })
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

  const handleDeleteTask = async (): Promise<void> => {
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

  const handleToggleCompletion = async (task: Task): Promise<void> => {
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

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ): Promise<void> => {
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

  const handleDeleteCompletedTasks = async (): Promise<void> => {
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
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">タスク</h1>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              タスクを作成
            </Button>
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

