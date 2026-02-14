'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useFocusShortcut } from '@/features/focus'
import { CheckSquare, Focus } from 'lucide-react'
import { useDevGoals } from '@/features/dev/goals'
import { useDevProjects } from '@/features/dev/projects'
import {
  useDevCalendarTasks,
  createDevTask,
  updateDevTask,
  deleteDevTask,
} from '@/features/dev/tasks'
import { mutate } from 'swr'
import { useUserSettings } from '@/features/settings'
import { useDialogState } from '@/hooks/useDialogState'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  useLogView,
  LogViewHeader,
  DevLogGoalsSection,
  DevLogDayContent,
} from '@/features/logs'
import { TaskForm } from '@/features/tasks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import {
  getDevYearlyGoalsForDate,
  getDevMonthlyGoalsForDate,
  getDevWeeklyGoalsForDate,
} from '@/features/logs'
import type { Task, CreateTaskInput } from '@/features/tasks'
import Link from 'next/link'

interface DevLogPageViewProps {
  currentDate: Date
  dateString: string
  datesToShow: Date[]
  displayTitle: string
  basePath: string
  onPrev: () => void
  onNext: () => void
}

type DevTaskTarget =
  | { kind: 'type'; value: 'inbox' | 'learning' }
  | { kind: 'project'; projectId: number }

function parseDevTaskTarget(value: string): DevTaskTarget | null {
  if (value === 'inbox' || value === 'learning') {
    return { kind: 'type', value }
  }
  if (value.startsWith('project:')) {
    const id = Number(value.slice('project:'.length))
    if (!Number.isFinite(id)) return null
    return { kind: 'project', projectId: id }
  }
  return null
}

function DevLogPageView({
  currentDate,
  dateString,
  datesToShow,
  displayTitle,
  basePath,
  onPrev,
  onNext,
}: DevLogPageViewProps) {
  const router = useRouter()
  useFocusShortcut({ path: '/dev/focus' })
  const year = getYear(currentDate)
  const {
    yearlyGoals: allYearlyGoals,
    monthlyGoals: allMonthlyGoals,
    weeklyGoals: allWeeklyGoals,
    isLoading: isLoadingGoals,
    error: goalsError,
  } = useDevGoals(year)
  const {
    tasks: allDevTasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useDevCalendarTasks()
  const { projects } = useDevProjects()
  const taskDialog = useDialogState<Task>()
  const [taskCreateTargetValue, setTaskCreateTargetValue] =
    useState<string>('inbox')
  const deleteConfirm = useDeleteConfirm<Task>()
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const { userSettings } = useUserSettings()

  const weekStartDay = userSettings?.weekStartDay ?? 1
  const goalsDate = datesToShow[0] ?? currentDate

  const yearlyGoals = useMemo(
    () => getDevYearlyGoalsForDate(allYearlyGoals, goalsDate),
    [allYearlyGoals, goalsDate],
  )
  const monthlyGoals = useMemo(
    () => getDevMonthlyGoalsForDate(allMonthlyGoals, goalsDate),
    [allMonthlyGoals, goalsDate],
  )
  const weeklyGoals = useMemo(
    () => getDevWeeklyGoalsForDate(allWeeklyGoals, goalsDate, weekStartDay),
    [allWeeklyGoals, goalsDate, weekStartDay],
  )

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const getTargetValueForTask = useCallback(
    (task: Task) => {
      const devTask = allDevTasks.find((t) => t.id === task.id)
      if (!devTask) return 'inbox'
      return devTask.projectId
        ? `project:${devTask.projectId}`
        : devTask.type === 'learning'
          ? 'learning'
          : 'inbox'
    },
    [allDevTasks],
  )

  const handleEditTask = (task: Task) => {
    const devTask = allDevTasks.find((t) => t.id === task.id)
    if (!devTask) return

    setTaskCreateTargetValue(getTargetValueForTask(task))
    taskDialog.handleEdit({
      ...task,
      memo: devTask.memo,
    })
  }

  const handleOpenCreateTask = () => {
    taskDialog.handleCreateClick()
    setTaskCreateTargetValue('inbox')
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    const target = parseDevTaskTarget(taskCreateTargetValue)
    if (!target) {
      setOperationError('タスクの作成先が無効です')
      return
    }
    const result = await execute(
      async () => {
        if (target.kind === 'type') {
          await createDevTask({
            title: input.title,
            projectId: null,
            type: target.value,
            executionDate: input.executionDate ?? dateString,
            memo: input.memo,
          })
        } else {
          await createDevTask({
            title: input.title,
            projectId: target.projectId,
            type: 'inbox',
            executionDate: input.executionDate ?? dateString,
            memo: input.memo,
          })
        }
        await mutate('dev-calendar-tasks')
        return true
      },
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      taskDialog.handleDialogClose(false)
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!taskDialog.editingItem) return

    const target = parseDevTaskTarget(taskCreateTargetValue)
    if (!target) {
      setOperationError('保存先が無効です')
      return
    }

    const taskId = taskDialog.editingItem.id
    const result = await execute(
      async () => {
        if (target.kind === 'type') {
          await updateDevTask(taskId, {
            title: input.title,
            projectId: null,
            type: target.value,
            executionDate: input.executionDate ?? undefined,
            memo: input.memo,
          })
        } else {
          await updateDevTask(taskId, {
            title: input.title,
            projectId: target.projectId,
            type: 'inbox',
            executionDate: input.executionDate ?? undefined,
            memo: input.memo,
          })
        }
        await mutate('dev-calendar-tasks')
        return true
      },
      'タスクの更新に失敗しました',
    )
    if (result !== undefined) {
      taskDialog.handleDialogClose(false)
    }
  }

  const handleDeleteTask = async () => {
    const taskToDelete = deleteConfirm.deletingItem
    if (!taskToDelete) return

    const result = await execute(
      async () => {
        await deleteDevTask(taskToDelete.id)
        await mutate('dev-calendar-tasks')
        return true
      },
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ) => {
    await execute(
      async () => {
        await updateDevTask(task.id, { executionDate })
        await mutate('dev-calendar-tasks')
      },
      'タスクの実行日の更新に失敗しました',
    )
  }

  const handleToggleTaskCompletion = async (task: Task) => {
    await execute(
      async () => {
        const devTask = allDevTasks.find((t) => t.id === task.id)
        if (!devTask) throw new Error('タスクが見つかりません')
        await updateDevTask(task.id, { completed: !task.completed })
        await mutate('dev-calendar-tasks')
      },
      'タスクの完了状態の更新に失敗しました',
    )
  }

  const isLoading = isLoadingGoals || isLoadingTasks
  const error = goalsError || tasksError

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <LogViewHeader
          displayTitle={displayTitle}
          basePath={basePath}
          onPrev={onPrev}
          onNext={onNext}
        />

        <ErrorMessage
          message={operationError || error || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-8">
            <DevLogGoalsSection
              yearlyGoals={yearlyGoals}
              monthlyGoals={monthlyGoals}
              weeklyGoals={weeklyGoals}
              currentDate={goalsDate}
            />
            {datesToShow.map((logDate) => (
              <div key={logDate.toISOString()} className="space-y-6">
                <DevLogDayContent
                  logDate={logDate}
                  allDevTasks={allDevTasks}
                  projects={projects}
                  execute={execute}
                  onToggleTask={handleToggleTaskCompletion}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteConfirm.handleDeleteClick}
                  onUpdateExecutionDate={handleUpdateExecutionDate}
                />
              </div>
            ))}
          </div>
        )}

        <Dialog open={taskDialog.isDialogOpen} onOpenChange={taskDialog.handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {taskDialog.editingItem ? 'タスクを編集' : '新しいタスクを作成'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">保存先</div>
                <Select
                  value={taskCreateTargetValue}
                  onValueChange={(value) => {
                    if (!parseDevTaskTarget(value)) return
                    setTaskCreateTargetValue(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="保存先を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbox">Inbox</SelectItem>
                    <SelectItem value="learning">学習</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={`project:${p.id}`}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TaskForm
                onSubmit={
                  taskDialog.editingItem ? handleUpdateTask : handleCreateTask
                }
                onCancel={() => taskDialog.handleDialogClose(false)}
                initialData={taskDialog.editingItem}
                defaultExecutionDate={dateString}
                submitLabel={taskDialog.editingItem ? '更新' : '作成'}
              />
            </div>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteTask}
          onCancel={deleteConfirm.handleDeleteCancel}
        />

        <FloatingActionButtons
          actions={[
            {
              id: 'focus',
              label: 'フォーカスモード',
              icon: <Focus className="h-5 w-5" />,
              onClick: () => router.push('/dev/focus'),
            },
            {
              id: 'create-task',
              label: 'タスクを作成',
              icon: <CheckSquare className="h-5 w-5" />,
              onClick: handleOpenCreateTask,
            },
          ]}
        />
      </div>
    </>
  )
}

function DevLogPageContent() {
  const logView = useLogView({ basePath: '/dev/logs' })

  if (!logView.isValidDate) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">無効な日付です</h1>
          <Link
            href="/dev"
            className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DevLogPageView
      currentDate={logView.currentDate}
      dateString={logView.dateString}
      datesToShow={logView.datesToShow}
      displayTitle={logView.displayTitle}
      basePath="/dev/logs"
      onPrev={logView.handlePrev}
      onNext={logView.handleNext}
    />
  )
}

export default function DevLogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DevLogPageContent />
    </Suspense>
  )
}
