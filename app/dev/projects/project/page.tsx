'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, Suspense } from 'react'
import useSWR from 'swr'
import { mutate } from 'swr'
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
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { groupTasks } from '@/lib/tasks/grouping'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Pencil, Trash2, Calendar, Focus } from 'lucide-react'

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

function DevProjectPageContent(): ReactElement | null {
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

  const projectDialog = useDialogState<DevProject>()
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
    updateOverdueTasksToToday,
  } = useDevTasks({
    projectId: Number.isFinite(projectId) ? projectId : undefined,
    type: undefined,
  })

  const taskDialog = useDialogState<Task>()
  const deleteConfirm = useDeleteConfirm<Task>()
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const {
    operationError: taskOperationError,
    setOperationError: setTaskOperationError,
    execute: executeTaskOperation,
  } = useAsyncOperation()

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

  if (mode !== 'development') {
    return null
  }

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
    projectDialog.handleDialogClose(false)
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

    const result = await executeTaskOperation(
      () =>
        createTask({
          title: input.title,
          projectId,
          type: 'inbox',
          executionDate: input.executionDate,
          memo: input.memo,
        }),
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      taskDialog.handleDialogClose(false)
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput): Promise<void> => {
    const task = taskDialog.editingItem
    if (!task) return

    const result = await executeTaskOperation(
      () =>
        updateTask(task.id, {
          title: input.title,
          executionDate: input.executionDate,
          memo: input.memo,
        }),
      'タスクの更新に失敗しました',
    )
    if (result !== undefined) {
      taskDialog.handleDialogClose(false)
    }
  }

  const handleDeleteTask = async (): Promise<void> => {
    const task = deleteConfirm.deletingItem
    if (!task) return

    const result = await executeTaskOperation(
      () => deleteTask(task.id),
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleCompletion = async (task: Task): Promise<void> => {
    await executeTaskOperation(
      () => toggleTaskCompletion(task.id, !task.completed),
      'タスクの完了状態の更新に失敗しました',
    )
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ): Promise<void> => {
    await executeTaskOperation(
      () => updateTask(task.id, { executionDate }),
      'タスクの実行日の更新に失敗しました',
    )
  }

  const handleDeleteCompletedTasksClick = () => {
    setIsDeletingCompletedDialogOpen(true)
  }

  const handleDeleteCompletedTasks = async (): Promise<void> => {
    const result = await executeTaskOperation(
      () => deleteCompletedTasks(),
      '完了済みタスクの削除に失敗しました',
    )
    if (result !== undefined) {
      setIsDeletingCompletedDialogOpen(false)
    }
  }

  const handleUpdateOverdueTasksToToday = async (): Promise<void> => {
    await executeTaskOperation(
      () => updateOverdueTasksToToday(),
      '期限切れタスクの更新に失敗しました',
    )
  }

  return (
    <>
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
                variant="ghost"
                size="icon"
                onClick={() => data && projectDialog.handleEdit(data)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="編集"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-muted-foreground hover:text-red-600 hover:dark:text-red-400"
                aria-label="削除"
              >
                <Trash2 className="h-4 w-4" />
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
              <div className="mt-3 border-b border-stone-200 py-4 dark:border-stone-800">
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
                  onClick={taskDialog.handleCreateClick}
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
                  defaultValue={visibleGroups.map((group) => group.key)}
                >
                  {visibleGroups.map((group) => (
                    <AccordionItem key={group.key} value={group.key}>
                      <AccordionHeader>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                                {group.title}
                              </h3>
                              {group.tasks.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {group.tasks.length}
                                </span>
                              )}
                            </div>
                            {group.key === 'overdue' && group.tasks.length > 0 && (
                              <span
                                role="button"
                                tabIndex={0}
                                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mr-2 [&_svg]:size-4"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  handleUpdateOverdueTasksToToday()
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleUpdateOverdueTasksToToday()
                                  }
                                }}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                今日に戻す
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className="space-y-4">
                          <TaskList
                            tasks={group.tasks}
                            onEdit={taskDialog.handleEdit}
                            onDelete={deleteConfirm.handleDeleteClick}
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
          open={projectDialog.isDialogOpen}
          onOpenChange={projectDialog.handleDialogClose}
          onSubmit={handleUpdate}
          project={projectDialog.editingItem ?? data ?? undefined}
        />

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          message={data ? `「${data.name}」を削除してもよろしいですか？` : ''}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />

        <TaskDialog
          open={taskDialog.isDialogOpen}
          onOpenChange={taskDialog.handleDialogClose}
          onSubmit={taskDialog.editingItem ? handleUpdateTask : handleCreateTask}
          task={taskDialog.editingItem}
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

        {Number.isFinite(projectId) && (
          <FloatingActionButtons
            actions={[
              {
                id: 'focus',
                label: 'フォーカスモード',
                icon: <Focus className="h-5 w-5" />,
                onClick: () => router.push(`/dev/focus?projectId=${projectId}`),
              },
            ]}
          />
        )}
      </div>
    </>
  )
}

export default function DevProjectPage(): ReactElement | null {
  return (
    <Suspense fallback={<Loading />}>
      <DevProjectPageContent />
    </Suspense>
  )
}

