'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'
import { mutate } from 'swr'
import { MainLayout } from '@/components/layout/MainLayout'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { Badge } from '@/components/ui/badge'
import { useMode } from '@/lib/contexts/ModeContext'
import { fetcher } from '@/lib/swr'
import { deleteDevProject, getDevProjectById, updateDevProject } from '@/lib/dev/projects'
import type { DevProject, ProjectStatus } from '@/lib/types/dev-project'
import { Button } from '@/components/ui/button'
import { ProjectDialog } from '@/components/dev/projects/ProjectDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { useState } from 'react'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { TaskList } from '@/components/tasks/TaskList'
import type { CreateTaskInput, Task } from '@/lib/types/task'
import { useDevTasks } from '@/hooks/useDevTasks'
import { groupTasks } from '@/lib/tasks/grouping'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Trash2 } from 'lucide-react'

const statusLabels: Record<ProjectStatus, string> = {
  draft: '下書き',
  in_progress: '進行中',
  released: 'リリース済み',
}

const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  released: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function formatDate(date: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function DevProjectPage(): ReactElement | null {
  const { mode } = useMode()
  const router = useRouter()
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const projectId = idParam ? Number(idParam) : NaN

  const shouldFetch = mode === 'development' && Number.isFinite(projectId)

  const { data, error, isLoading } = useSWR<DevProject | null>(
    shouldFetch ? `dev-project-${projectId}` : null,
    () => fetcher(() => getDevProjectById(projectId)),
  )

  if (mode !== 'development') {
    return null
  }

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
    projectId: Number.isFinite(projectId) ? projectId : undefined,
    type: undefined,
  })

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const [taskOperationError, setTaskOperationError] = useState<string | null>(null)

  const groupedTasks = useMemo(() => groupTasks(tasks), [tasks])

  const handleUpdate = async (input: {
    name: string
    startDate?: string | null
    endDate?: string | null
    status?: ProjectStatus
  }) => {
    if (!Number.isFinite(projectId)) return
    await updateDevProject(projectId, input)
    await Promise.all([
      mutate(`dev-project-${projectId}`),
      mutate('dev-projects'),
    ])
    setIsEditDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!Number.isFinite(projectId)) return
    try {
      setDeleteError(null)
      await deleteDevProject(projectId)
      await mutate('dev-projects')
      router.push('/dev/projects')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '削除に失敗しました')
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCreateTask = async (input: CreateTaskInput): Promise<void> => {
    if (!Number.isFinite(projectId)) return

    try {
      setTaskOperationError(null)
      await createTask({
        title: input.title,
        projectId,
        type: 'inbox',
        executionDate: input.executionDate,
      })
      setIsTaskDialogOpen(false)
    } catch (err) {
      setTaskOperationError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
      )
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput): Promise<void> => {
    if (!editingTask) return

    try {
      setTaskOperationError(null)
      await updateTask(editingTask.id, {
        title: input.title,
        executionDate: input.executionDate,
      })
      setIsTaskDialogOpen(false)
      setEditingTask(undefined)
    } catch (err) {
      setTaskOperationError(
        err instanceof Error ? err.message : 'タスクの更新に失敗しました',
      )
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleTaskDialogClose = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setEditingTask(undefined)
    }
  }

  const handleDeleteTask = async (): Promise<void> => {
    if (!deletingTask) return

    try {
      setTaskOperationError(null)
      await deleteTask(deletingTask.id)
      setDeletingTask(undefined)
    } catch (err) {
      setTaskOperationError(
        err instanceof Error ? err.message : 'タスクの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task)
  }

  const handleToggleCompletion = async (task: Task): Promise<void> => {
    try {
      setTaskOperationError(null)
      await toggleTaskCompletion(task.id, !task.completed)
    } catch (err) {
      setTaskOperationError(
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
      setTaskOperationError(null)
      await updateTask(task.id, { executionDate })
    } catch (err) {
      setTaskOperationError(
        err instanceof Error ? err.message : 'タスクの実行日の更新に失敗しました',
      )
    }
  }

  const handleDeleteCompletedTasksClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedTasks = async (): Promise<void> => {
    try {
      setTaskOperationError(null)
      await deleteCompletedTasks()
      setIsDeletingCompletedDialogOpen(false)
    } catch (err) {
      setTaskOperationError(
        err instanceof Error
          ? err.message
          : '完了済みタスクの削除に失敗しました',
      )
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dev/projects"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              ← プロジェクト一覧へ
            </Link>
            <h1 className="mt-2 text-3xl font-bold">
              {data?.name ?? 'プロジェクト'}
            </h1>
          </div>
          {data && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                削除
              </Button>
            </div>
          )}
        </div>

        <ErrorMessage
          message={deleteError || ''}
          onDismiss={deleteError ? () => setDeleteError(null) : undefined}
        />

        <ErrorMessage
          message={taskOperationError || tasksError || ''}
          onDismiss={taskOperationError ? () => setTaskOperationError(null) : undefined}
        />

        {!Number.isFinite(projectId) ? (
          <ErrorMessage message="不正なプロジェクトIDです" />
        ) : isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage
            message={error instanceof Error ? error.message : '取得に失敗しました'}
          />
        ) : !data ? (
          <ErrorMessage message="プロジェクトが見つかりませんでした" />
        ) : (
          <div className="space-y-6">
            <section>
              <div className="mt-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      開始日
                    </dt>
                    <dd className="mt-1 text-sm">
                      {formatDate(data.startDate) ?? '未設定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      期限（終了日）
                    </dt>
                    <dd className="mt-1 text-sm">
                      {formatDate(data.endDate) ?? '未設定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      ステータス
                    </dt>
                    <dd className="mt-1">
                      <Badge className={statusColors[data.status]}>
                        {statusLabels[data.status]}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">タスク</h2>
                <Button
                  onClick={() => setIsTaskDialogOpen(true)}
                  disabled={!Number.isFinite(projectId)}
                >
                  タスクを作成
                </Button>
              </div>

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
                            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                              {group.title}
                            </h3>
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
            </section>
          </div>
        )}

        <ProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          project={data || undefined}
        />

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          message={data ? `「${data.name}」を削除してもよろしいですか？` : ''}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />

        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={handleTaskDialogClose}
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

