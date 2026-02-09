'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, getYear } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { parseISO, isValid, addDays, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckSquare, Focus } from 'lucide-react'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useDevCalendarTasks } from '@/hooks/useDevCalendarTasks'
import { useDevProjects } from '@/hooks/useDevProjects'
import { createDevTask, updateDevTask, deleteDevTask } from '@/lib/dev/tasks'
import { mutate } from 'swr'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useDevDailyLog } from '@/hooks/useDevDailyLog'
import { useDialogState } from '@/hooks/useDialogState'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { DevLogGoalsSection } from '@/components/dev/logs/DevLogGoalsSection'
import { DevLogTasksSection } from '@/components/dev/logs/DevLogTasksSection'
import { DevLogReportSection } from '@/components/dev/logs/DevLogReportSection'
import { TaskForm } from '@/components/tasks/TaskForm'
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
  getDevTasksForDate,
} from '@/lib/dev/logs/utils'
import type { Task, CreateTaskInput } from '@/lib/types/task'
import type { UpdateDevDailyLogInput } from '@/lib/types/dev-daily-log'
import Link from 'next/link'

interface DevLogPageViewProps {
  logDate: Date
  date: string
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

function DevLogPageView({ logDate, date }: DevLogPageViewProps) {
  const router = useRouter()
  const year = getYear(logDate)
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
  const {
    devDailyLog,
    isLoading: isLoadingDailyLog,
    createDevDailyLog,
    updateDevDailyLog,
    error: dailyLogError,
  } = useDevDailyLog(date)

  const weekStartDay = userSettings?.weekStartDay ?? 1

  const yearlyGoals = useMemo(
    () => getDevYearlyGoalsForDate(allYearlyGoals, logDate),
    [allYearlyGoals, logDate],
  )
  const monthlyGoals = useMemo(
    () => getDevMonthlyGoalsForDate(allMonthlyGoals, logDate),
    [allMonthlyGoals, logDate],
  )
  const weeklyGoals = useMemo(
    () => getDevWeeklyGoalsForDate(allWeeklyGoals, logDate, weekStartDay),
    [allWeeklyGoals, logDate, weekStartDay],
  )

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const devTasksForDate = useMemo(
    () => getDevTasksForDate(allDevTasks, logDate),
    [allDevTasks, logDate],
  )

  const tasks: Task[] = useMemo(() => {
    return devTasksForDate.map((t) => ({
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
  }, [devTasksForDate])

  const getTaskTargetLabel = useCallback(
    (task: Task) => {
      const devTask = allDevTasks.find((t) => t.id === task.id)
      if (!devTask) return ''
      return devTask.projectId
        ? projectNameById.get(devTask.projectId) ?? `プロジェクト#${devTask.projectId}`
        : devTask.type === 'learning'
          ? '学習'
          : 'Inbox'
    },
    [allDevTasks, projectNameById],
  )

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

  const formattedDate = format(logDate, 'yyyy年M月d日(E)', { locale: ja })
  const prevDate = subDays(logDate, 1)
  const nextDate = addDays(logDate, 1)

  const handlePrevDate = () => {
    router.push(`/dev/logs?date=${format(prevDate, 'yyyy-MM-dd')}`)
  }

  const handleNextDate = () => {
    router.push(`/dev/logs?date=${format(nextDate, 'yyyy-MM-dd')}`)
  }

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
            executionDate: input.executionDate ?? date,
            memo: input.memo,
          })
        } else {
          await createDevTask({
            title: input.title,
            projectId: target.projectId,
            type: 'inbox',
            executionDate: input.executionDate ?? date,
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

  const handleUpdateReport = async (input: UpdateDevDailyLogInput) => {
    await execute(
      async () => {
        if (devDailyLog) {
          await updateDevDailyLog(input)
        } else {
          await createDevDailyLog({ logDate: date, report: input.report })
        }
      },
      '日報の保存に失敗しました',
    )
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

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingDailyLog
  const error = goalsError || tasksError || dailyLogError

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{formattedDate}のログ</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevDate}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">前日</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDate}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">翌日</span>
              </Button>
            </div>
          </div>
        </div>

        <ErrorMessage
          message={operationError || error || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <DevLogGoalsSection
                yearlyGoals={yearlyGoals}
                monthlyGoals={monthlyGoals}
                weeklyGoals={weeklyGoals}
                currentDate={logDate}
              />
              <DevLogReportSection
                devDailyLog={devDailyLog}
                isLoading={isLoadingDailyLog}
                onUpdate={handleUpdateReport}
              />
            </div>
            <div>
              <DevLogTasksSection
                tasks={tasks}
                getTargetLabel={getTaskTargetLabel}
                onToggleCompletion={handleToggleTaskCompletion}
                onEdit={handleEditTask}
                onDelete={deleteConfirm.handleDeleteClick}
                onUpdateExecutionDate={handleUpdateExecutionDate}
              />
            </div>
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
                defaultExecutionDate={date}
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
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const date = dateParam || format(new Date(), 'yyyy-MM-dd')

  const logDate = parseISO(date)
  if (!isValid(logDate)) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">無効な日付です</h1>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return <DevLogPageView logDate={logDate} date={date} />
}

export default function DevLogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DevLogPageContent />
    </Suspense>
  )
}
