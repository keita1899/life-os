'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFocusShortcut } from '@/features/focus'
import { useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { mutate } from 'swr'
import { SWR_KEYS } from '@/lib/swr-keys'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  deleteDevProject,
  getDevProjectById,
  updateDevProject,
  ProjectDialog,
} from '@/features/dev/projects'
import type { DevProject, ProjectStatus } from '@/features/dev/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import { CreateButton } from '@/components/ui/create-button'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { useState } from 'react'
import { TaskDialog, TaskList, groupTasks } from '@/features/tasks'
import type { CreateTaskInput, Task } from '@/features/tasks'
import { useDevTasks } from '@/features/dev/tasks'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import { getTodayDateString, getTomorrowDateString } from '@/lib/date/formats'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { useCrossGroupDnd } from '@/hooks/useCrossGroupDnd'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { DragOverlayPreview } from '@/components/ui/drag-overlay-preview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pencil,
  Trash2,
  Calendar,
  Focus,
  CheckSquare,
  StickyNote,
  FileText,
  Database,
  BookOpen,
  ChevronDown,
  Check,
  X,
  Globe,
  Github,
  ExternalLink,
} from 'lucide-react'
import {
  useDevMemosByProjectId,
  MemoDialog,
  MemoList,
} from '@/features/dev/memos'
import type {
  DevMemo,
  CreateDevMemoInput,
  UpdateDevMemoInput,
} from '@/features/dev/memos'
import {
  useProjectRequirements,
  DEFAULT_REQUIREMENTS_TEMPLATE,
} from '@/features/dev/requirements'
import {
  useProjectDbDesign,
  DEFAULT_DB_DESIGN_DATA,
  serializeDesignData,
} from '@/features/dev/db-designs'
import {
  useProjectReadme,
  DEFAULT_README_TEMPLATE,
} from '@/features/dev/readmes'

const RequirementsEditor = dynamic(
  () =>
    import('@/features/dev/requirements').then((m) => ({
      default: m.RequirementsEditor,
    })),
  { loading: () => <Loading /> },
)

const DbDesignEditor = dynamic(
  () =>
    import('@/features/dev/db-designs').then((m) => ({
      default: m.DbDesignEditor,
    })),
  { loading: () => <Loading />, ssr: false },
)

const ReadmeEditor = dynamic(
  () =>
    import('@/features/dev/readmes').then((m) => ({
      default: m.ReadmeEditor,
    })),
  { loading: () => <Loading /> },
)

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const projectId = idParam ? Number(idParam) : NaN

  useFocusShortcut({
    path: Number.isFinite(projectId) ? `/dev/focus?projectId=${projectId}` : '/dev/focus',
  })

  const shouldFetch = Number.isFinite(projectId)

  const { data, error, isLoading } = useSWR<DevProject | null>(
    shouldFetch ? SWR_KEYS.devProject(projectId) : null,
    () => getDevProjectById(projectId),
  )

  const projectDialog = useDialogState<DevProject>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editingUrl, setEditingUrl] = useState<'production' | 'github' | null>(null)
  const [urlDraft, setUrlDraft] = useState('')

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
    projectId: Number.isFinite(projectId) ? projectId : undefined,
    type: undefined,
  })

  const [activeTab, setActiveTab] = useState('tasks')
  const taskDialog = useDialogState<Task>()
  const memoDialog = useDialogState<DevMemo>()
  useCreateShortcut({
    onCreate: activeTab === 'memos' ? memoDialog.handleCreateClick : taskDialog.handleCreateClick,
    enabled: shouldFetch && !taskDialog.isDialogOpen && !memoDialog.isDialogOpen && activeTab !== 'requirements' && activeTab !== 'db-design' && activeTab !== 'readme',
  })
  const deleteConfirm = useDeleteConfirm<Task>()
  const [isDeletingCompletedDialogOpen, setIsDeletingCompletedDialogOpen] =
    useState(false)
  const {
    operationError: taskOperationError,
    setOperationError: setTaskOperationError,
    execute: executeTaskOperation,
  } = useAsyncOperation()
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
      recurrenceCompletedDates: [],
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

  const groupKeys = useMemo(
    () => visibleGroups.map((g) => g.key),
    [visibleGroups],
  )
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
      await executeTaskOperation(
        () => updateTask(id, { executionDate }),
        'タスクの移動に失敗しました',
      )
    },
  })

  const memoDeleteConfirm = useDeleteConfirm<DevMemo>()

  const {
    memos,
    isLoading: isMemosLoading,
    createMemo,
    updateMemo,
    deleteMemo,
  } = useDevMemosByProjectId(
    Number.isFinite(projectId) ? projectId : null,
  )
  const {
    requirements,
    isLoading: isRequirementsLoading,
    upsertRequirements,
  } = useProjectRequirements(
    Number.isFinite(projectId) ? projectId : null,
  )
  const {
    dbDesign,
    isLoading: isDbDesignLoading,
    upsertDbDesign,
  } = useProjectDbDesign(
    Number.isFinite(projectId) ? projectId : null,
  )
  const {
    readme,
    isLoading: isReadmeLoading,
    upsertReadme,
  } = useProjectReadme(
    Number.isFinite(projectId) ? projectId : null,
  )

  const handleUpdate = async (input: {
    name: string
    startDate?: string | null
    endDate?: string | null
    status?: ProjectStatus
    productionUrl?: string | null
    githubUrl?: string | null
  }) => {
    if (!Number.isFinite(projectId)) return
    await updateDevProject(projectId, input)
    await Promise.all([
      mutate(SWR_KEYS.devProject(projectId)),
      mutate(SWR_KEYS.devProjects),
    ])
    projectDialog.handleDialogClose(false)
  }

  const handleRenameProject = async (name: string) => {
    if (!Number.isFinite(projectId)) return
    await executeTaskOperation(async () => {
      await updateDevProject(projectId, { name })
      await Promise.all([
        mutate(SWR_KEYS.devProject(projectId)),
        mutate(SWR_KEYS.devProjects),
      ])
    }, 'プロジェクト名の更新に失敗しました')
  }

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!Number.isFinite(projectId)) return
    if (data?.status === newStatus) return
    await executeTaskOperation(async () => {
      await updateDevProject(projectId, { status: newStatus })
      await Promise.all([
        mutate(SWR_KEYS.devProject(projectId)),
        mutate(SWR_KEYS.devProjects),
      ])
    }, 'ステータスの更新に失敗しました')
  }

  const handleStartEditUrl = (type: 'production' | 'github') => {
    setUrlDraft(
      type === 'production'
        ? data?.productionUrl ?? ''
        : data?.githubUrl ?? '',
    )
    setEditingUrl(type)
  }

  const handleSaveUrl = async () => {
    if (!Number.isFinite(projectId) || !editingUrl) return
    const field =
      editingUrl === 'production' ? 'productionUrl' : 'githubUrl'
    await executeTaskOperation(async () => {
      await updateDevProject(projectId, { [field]: urlDraft || null })
      await Promise.all([
        mutate(SWR_KEYS.devProject(projectId)),
        mutate(SWR_KEYS.devProjects),
      ])
    }, 'URL の更新に失敗しました')
    setEditingUrl(null)
  }

  const handleCancelEditUrl = () => {
    setEditingUrl(null)
    setUrlDraft('')
  }

  const handleDelete = async () => {
    if (!Number.isFinite(projectId)) return
    try {
      setDeleteError(null)
      await deleteDevProject(projectId)
      await mutate(SWR_KEYS.devProjects)
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
      setDefaultDate(undefined)
    }
  }

  const handleInlineCreate = (date: string | null) => {
    setDefaultDate(date)
    taskDialog.handleCreateClick()
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

  const handleRenameTask = async (task: Task, title: string) => {
    await executeTaskOperation(
      () => updateTask(task.id, { title }),
      'タスク名の更新に失敗しました',
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

  const handleCreateMemo = async (
    input: CreateDevMemoInput,
  ): Promise<void> => {
    const result = await executeTaskOperation(
      () => createMemo(input),
      'メモの作成に失敗しました',
    )
    if (result !== undefined) {
      memoDialog.handleDialogClose(false)
    }
  }

  const handleUpdateMemo = async (
    input: UpdateDevMemoInput,
  ): Promise<void> => {
    const memo = memoDialog.editingItem
    if (!memo) return
    const result = await executeTaskOperation(
      () => updateMemo(memo.id, input),
      'メモの更新に失敗しました',
    )
    if (result !== undefined) {
      memoDialog.handleDialogClose(false)
    }
  }

  const handleDeleteMemo = async (): Promise<void> => {
    const memo = memoDeleteConfirm.deletingItem
    if (!memo) return
    const result = await executeTaskOperation(
      () => deleteMemo(memo.id),
      'メモの削除に失敗しました',
    )
    if (result !== undefined) {
      memoDeleteConfirm.clearDeletingItem()
    }
  }

  const handleSaveRequirements = async (content: string): Promise<void> => {
    await executeTaskOperation(
      () => upsertRequirements(content),
      '要件定義の保存に失敗しました',
    )
  }

  const handleSaveDbDesign = async (content: string): Promise<void> => {
    await executeTaskOperation(
      () => upsertDbDesign(content),
      'DB設計の保存に失敗しました',
    )
  }

  const handleSaveReadme = async (content: string): Promise<void> => {
    await executeTaskOperation(
      () => upsertReadme(content),
      'READMEの保存に失敗しました',
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
              {data ? (
                <InlineEditableText
                  value={data.name}
                  onSave={handleRenameProject}
                />
              ) : (
                'プロジェクト'
              )}
            </h1>
          </div>
          {data && (
            <EditDeleteDropdownMenu
              onEdit={() => projectDialog.handleEdit(data)}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
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
                      {formatDate(data.startDate) ?? '未定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      期限（終了日）
                    </dt>
                    <dd className="mt-1 text-sm">
                      {formatDate(data.endDate) ?? '未定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      ステータス
                    </dt>
                    <dd className="mt-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <Badge className={statusColors[data.status]}>
                              {statusLabels[data.status]}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {(
                            Object.entries(statusLabels) as [
                              ProjectStatus,
                              string,
                            ][]
                          ).map(([value, label]) => (
                            <DropdownMenuItem
                              key={value}
                              onClick={() => void handleStatusChange(value)}
                            >
                              <span className="flex items-center gap-2">
                                {data.status === value ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <span className="h-3.5 w-3.5" />
                                )}
                                <Badge className={statusColors[value]}>
                                  {label}
                                </Badge>
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </dd>
                  </div>
                </dl>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      本番 URL
                    </dt>
                    <dd className="mt-1">
                      {editingUrl === 'production' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void handleSaveUrl()
                              if (e.key === 'Escape') handleCancelEditUrl()
                            }}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => void handleSaveUrl()}
                            aria-label="保存"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEditUrl}
                            aria-label="キャンセル"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditUrl('production')}
                          className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          {data.productionUrl ? (
                            <span className="underline underline-offset-4">
                              {data.productionUrl}
                            </span>
                          ) : (
                            <span className="italic">未設定</span>
                          )}
                          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                      {data.productionUrl && editingUrl !== 'production' && (
                        <a
                          href={data.productionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          開く
                        </a>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      GitHub URL
                    </dt>
                    <dd className="mt-1">
                      {editingUrl === 'github' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="url"
                            placeholder="https://github.com/user/repo"
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void handleSaveUrl()
                              if (e.key === 'Escape') handleCancelEditUrl()
                            }}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => void handleSaveUrl()}
                            aria-label="保存"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEditUrl}
                            aria-label="キャンセル"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditUrl('github')}
                          className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-3.5 w-3.5" />
                          {data.githubUrl ? (
                            <span className="underline underline-offset-4">
                              {data.githubUrl}
                            </span>
                          ) : (
                            <span className="italic">未設定</span>
                          )}
                          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                      {data.githubUrl && editingUrl !== 'github' && (
                        <a
                          href={data.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          開く
                        </a>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full max-w-[600px] grid-cols-5">
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  タスク
                </TabsTrigger>
                <TabsTrigger value="memos" className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  メモ
                </TabsTrigger>
                <TabsTrigger
                  value="requirements"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  要件定義
                </TabsTrigger>
                <TabsTrigger
                  value="db-design"
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  DB設計
                </TabsTrigger>
                <TabsTrigger
                  value="readme"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  README
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="mt-6 space-y-4">
                <div className="flex items-center justify-end">
                  <CreateButton
                    label="タスクを作成"
                    onClick={taskDialog.handleCreateClick}
                    disabled={!Number.isFinite(projectId)}
                  />
                </div>
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
                                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                                  {group.title}
                                </h3>
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
                                onEdit={taskDialog.handleEdit}
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
              </TabsContent>

              <TabsContent value="memos" className="mt-6 space-y-4">
                <div className="flex items-center justify-end">
                  <CreateButton
                    label="メモを追加"
                    onClick={memoDialog.handleCreateClick}
                    disabled={!Number.isFinite(projectId)}
                  />
                </div>
                {isMemosLoading ? (
                  <Loading />
                ) : (
                  <MemoList
                    memos={memos}
                    projects={data ? [data] : []}
                    onEdit={memoDialog.handleEdit}
                    onDelete={memoDeleteConfirm.handleDeleteClick}
                  />
                )}
              </TabsContent>

              <TabsContent value="requirements" className="mt-6 space-y-4">
                {isRequirementsLoading ? (
                  <Loading />
                ) : (
                  <RequirementsEditor
                    initialContent={
                      requirements?.content ?? DEFAULT_REQUIREMENTS_TEMPLATE
                    }
                    onSave={handleSaveRequirements}
                  />
                )}
              </TabsContent>

              <TabsContent value="db-design" className="mt-6 space-y-4">
                {isDbDesignLoading ? (
                  <Loading />
                ) : (
                  <DbDesignEditor
                    initialContent={
                      dbDesign?.content ?? serializeDesignData(DEFAULT_DB_DESIGN_DATA)
                    }
                    onSave={handleSaveDbDesign}
                  />
                )}
              </TabsContent>

              <TabsContent value="readme" className="mt-6 space-y-4">
                {isReadmeLoading ? (
                  <Loading />
                ) : (
                  <ReadmeEditor
                    initialContent={
                      readme?.content ?? DEFAULT_README_TEMPLATE
                    }
                    onSave={handleSaveReadme}
                  />
                )}
              </TabsContent>
            </Tabs>
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
          onOpenChange={(open) => {
            taskDialog.handleDialogClose(open)
            if (!open) setDefaultDate(undefined)
          }}
          onSubmit={taskDialog.editingItem ? handleUpdateTask : handleCreateTask}
          task={taskDialog.editingItem}
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

        {Number.isFinite(projectId) && (
          <MemoDialog
            open={memoDialog.isDialogOpen}
            onOpenChange={memoDialog.handleDialogClose}
            onSubmit={
              memoDialog.editingItem ? handleUpdateMemo : handleCreateMemo
            }
            memo={memoDialog.editingItem}
            fixedProjectId={projectId}
          />
        )}

        <DeleteConfirmDialog
          open={!!memoDeleteConfirm.deletingItem}
          message="このメモを削除しますか？この操作は取り消せません。"
          onConfirm={handleDeleteMemo}
          onCancel={memoDeleteConfirm.handleDeleteCancel}
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

