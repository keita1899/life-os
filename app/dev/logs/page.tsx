'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, getYear } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { parseISO, isValid, addDays, subDays } from 'date-fns'
import { useMode } from '@/lib/contexts/ModeContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useDevCalendarTasks } from '@/hooks/useDevCalendarTasks'
import { useDevProjects } from '@/hooks/useDevProjects'
import { createDevTask, updateDevTask, deleteDevTask } from '@/lib/dev/tasks'
import { mutate } from 'swr'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useDevDailyLog } from '@/hooks/useDevDailyLog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { DevLogGoalsSection } from '@/components/dev/logs/DevLogGoalsSection'
import { DevLogTasksSection } from '@/components/dev/logs/DevLogTasksSection'
import { DevLogReportSection } from '@/components/dev/logs/DevLogReportSection'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import {
  getDevYearlyGoalsForDate,
  getDevMonthlyGoalsForDate,
  getDevWeeklyGoalsForDate,
  getDevTasksForDate,
} from '@/lib/dev/logs/utils'
import type { Task, CreateTaskInput } from '@/lib/types/task'
import type { DevTask } from '@/lib/types/dev-task'
import type { UpdateDevDailyLogInput } from '@/lib/types/dev-daily-log'
import Link from 'next/link'

interface DevLogPageViewProps {
  logDate: Date
  date: string
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
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)
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
    return devTasksForDate.map((t) => {
      const prefix = t.projectId
        ? projectNameById.get(t.projectId) ?? `プロジェクト#${t.projectId}`
        : t.type === 'learning'
          ? '学習'
          : 'Inbox'

      return {
        id: t.id,
        title: `${prefix}: ${t.title}`,
        executionDate: t.executionDate,
        completed: t.completed,
        order: t.order,
        actualTime: t.actualTime,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }
    })
  }, [devTasksForDate, projectNameById])

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

    const prefix = devTask.projectId
      ? projectNameById.get(devTask.projectId) ?? `プロジェクト#${devTask.projectId}`
      : devTask.type === 'learning'
        ? '学習'
        : 'Inbox'

    const titleWithoutPrefix = task.title.replace(`${prefix}: `, '')
    setEditingTask({
      ...task,
      title: titleWithoutPrefix,
    })
    setIsTaskDialogOpen(true)
  }

  const handleOpenCreateTask = () => {
    setEditingTask(undefined)
    setIsTaskDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setEditingTask(undefined)
    }
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      setOperationError(null)
      await createDevTask({
        title: input.title,
        projectId: null,
        type: 'inbox',
        executionDate: input.executionDate ?? date,
      })
      await mutate('dev-calendar-tasks')
      setIsTaskDialogOpen(false)
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
      const devTask = allDevTasks.find((t) => t.id === editingTask.id)
      if (!devTask) return

      await updateDevTask(editingTask.id, {
        title: input.title,
        executionDate: input.executionDate,
      })
      await mutate('dev-calendar-tasks')
      setIsTaskDialogOpen(false)
      setEditingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの更新に失敗しました',
      )
    }
  }

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task)
  }

  const handleDeleteTask = async () => {
    if (!deletingTask) return

    try {
      setOperationError(null)
      await deleteDevTask(deletingTask.id)
      await mutate('dev-calendar-tasks')
      setDeletingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの削除に失敗しました',
      )
    }
  }

  const handleUpdateReport = async (input: UpdateDevDailyLogInput) => {
    try {
      setOperationError(null)
      if (devDailyLog) {
        await updateDevDailyLog(input)
      } else {
        await createDevDailyLog({ logDate: date, report: input.report })
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '日報の保存に失敗しました',
      )
    }
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ) => {
    try {
      setOperationError(null)
      await updateDevTask(task.id, { executionDate })
      await mutate('dev-calendar-tasks')
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの実行日の更新に失敗しました',
      )
    }
  }

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingDailyLog
  const error = goalsError || tasksError || dailyLogError

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
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
          <div className="space-y-6">
            <DevLogGoalsSection
              yearlyGoals={yearlyGoals}
              monthlyGoals={monthlyGoals}
              weeklyGoals={weeklyGoals}
            />
            <DevLogTasksSection
              tasks={tasks}
              onToggleCompletion={async (task) => {
                try {
                  setOperationError(null)
                  const devTask = allDevTasks.find((t) => t.id === task.id)
                  if (!devTask) return
                  await updateDevTask(task.id, { completed: !task.completed })
                  await mutate('dev-calendar-tasks')
                } catch (err) {
                  setOperationError(
                    err instanceof Error
                      ? err.message
                      : 'タスクの完了状態の更新に失敗しました',
                  )
                }
              }}
              onEdit={handleEditTask}
              onDelete={handleDeleteClick}
              onUpdateExecutionDate={handleUpdateExecutionDate}
            />
            <DevLogReportSection
              devDailyLog={devDailyLog}
              isLoading={isLoadingDailyLog}
              onUpdate={handleUpdateReport}
            />
          </div>
        )}

        <TaskDialog
          open={isTaskDialogOpen}
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

        <FloatingActionButtons
          actions={[
            {
              id: 'create-task',
              label: 'タスクを作成',
              icon: <CheckSquare className="h-5 w-5" />,
              onClick: handleOpenCreateTask,
            },
          ]}
        />
      </div>
    </MainLayout>
  )
}

function DevLogPageContent() {
  const { mode } = useMode()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const date = dateParam || format(new Date(), 'yyyy-MM-dd')

  const logDate = parseISO(date)
  if (!isValid(logDate)) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
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

  if (mode !== 'development') {
    return null
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
