'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, getYear } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { parseISO, isValid, addDays, subDays } from 'date-fns'
import { useMode } from '@/lib/contexts/ModeContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { useTasks } from '@/hooks/useTasks'
import { useEvents } from '@/hooks/useEvents'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useDailyLog } from '@/hooks/useDailyLog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { LogGoalsSection } from '@/components/logs/LogGoalsSection'
import { LogTasksSection } from '@/components/logs/LogTasksSection'
import { LogEventsSection } from '@/components/logs/LogEventsSection'
import { LogDiarySection } from '@/components/logs/LogDiarySection'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import {
  getYearlyGoalsForDate,
  getMonthlyGoalsForDate,
  getWeeklyGoalsForDate,
  getTasksForDate,
  getEventsForDateSorted,
} from '@/lib/logs/utils'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types/task'
import type { UpdateDailyLogInput } from '@/lib/types/daily-log'
import Link from 'next/link'

interface LogPageViewProps {
  logDate: Date
  date: string
}

function LogPageView({ logDate, date }: LogPageViewProps) {
  const router = useRouter()
  const year = getYear(logDate)
  const {
    yearlyGoals: allYearlyGoals,
    monthlyGoals: allMonthlyGoals,
    weeklyGoals: allWeeklyGoals,
    isLoading: isLoadingGoals,
    error: goalsError,
  } = useGoals(year)
  const {
    tasks: allTasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
  } = useTasks()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)
  const {
    events: allEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useEvents()
  const { userSettings } = useUserSettings()
  const {
    dailyLog,
    isLoading: isLoadingDailyLog,
    createDailyLog,
    updateDailyLog,
  } = useDailyLog(date)

  const weekStartDay = userSettings?.weekStartDay ?? 1

  const yearlyGoals = useMemo(
    () => getYearlyGoalsForDate(allYearlyGoals, logDate),
    [allYearlyGoals, logDate],
  )
  const monthlyGoals = useMemo(
    () => getMonthlyGoalsForDate(allMonthlyGoals, logDate),
    [allMonthlyGoals, logDate],
  )
  const weeklyGoals = useMemo(
    () => getWeeklyGoalsForDate(allWeeklyGoals, logDate, weekStartDay),
    [allWeeklyGoals, logDate, weekStartDay],
  )
  const tasks = useMemo(
    () => getTasksForDate(allTasks, logDate),
    [allTasks, logDate],
  )
  const events = useMemo(
    () => getEventsForDateSorted(allEvents, logDate),
    [allEvents, logDate],
  )

  const formattedDate = format(logDate, 'yyyy年M月d日(E)', { locale: ja })
  const prevDate = subDays(logDate, 1)
  const nextDate = addDays(logDate, 1)

  const handlePrevDate = () => {
    router.push(`/logs?date=${format(prevDate, 'yyyy-MM-dd')}`)
  }

  const handleNextDate = () => {
    router.push(`/logs?date=${format(nextDate, 'yyyy-MM-dd')}`)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setEditingTask(undefined)
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    try {
      setOperationError(null)
      const updateInput: UpdateTaskInput = {
        title: input.title,
        executionDate: input.executionDate,
      }
      await updateTask(editingTask.id, updateInput)
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
      await deleteTask(deletingTask.id)
      setDeletingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの削除に失敗しました',
      )
    }
  }

  const handleUpdateDiary = async (input: UpdateDailyLogInput) => {
    try {
      setOperationError(null)
      if (dailyLog) {
        await updateDailyLog(input)
      } else {
        await createDailyLog({ logDate: date, diary: input.diary })
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '日記の保存に失敗しました',
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

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingEvents || isLoadingDailyLog
  const error = goalsError || tasksError || eventsError

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
          <LogGoalsSection
            yearlyGoals={yearlyGoals}
            monthlyGoals={monthlyGoals}
            weeklyGoals={weeklyGoals}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LogEventsSection events={events} />
            <LogTasksSection
              tasks={tasks}
              onToggleCompletion={(task) =>
                toggleTaskCompletion(task.id, !task.completed)
              }
              onEdit={handleEditTask}
              onDelete={handleDeleteClick}
              onUpdateExecutionDate={handleUpdateExecutionDate}
            />
          </div>
          <LogDiarySection
            dailyLog={dailyLog}
            isLoading={isLoadingDailyLog}
            onUpdate={handleUpdateDiary}
          />
        </div>
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleUpdateTask}
        task={editingTask}
      />

      <DeleteConfirmDialog
        open={!!deletingTask}
        message={`「${deletingTask?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(undefined)}
      />
      </div>
    </MainLayout>
  )
}

function LogPageContent() {
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

  if (mode !== 'life') {
    return null
  }

  return <LogPageView logDate={logDate} date={date} />
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-4xl py-8 px-4">読み込み中...</div>}>
      <LogPageContent />
    </Suspense>
  )
}
