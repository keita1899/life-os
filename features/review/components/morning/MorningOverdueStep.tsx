'use client'

import { useMemo } from 'react'
import { mutate } from 'swr'
import { useTasks } from '@/features/tasks'
import { useDevCalendarTasks, updateDevTask, updateAllOverdueDevTasksToToday } from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { TaskList } from '@/features/tasks'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SWR_KEYS } from '@/lib/swr-keys'
import type { Task } from '@/features/tasks'
import type { ReviewMode } from '../../types/review-completion'
import { format } from 'date-fns'

interface MorningOverdueStepProps {
  today: Date
  mode: ReviewMode
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
}

function devTaskToTask(devTask: {
  id: number
  title: string
  executionDate: string | null
  completed: boolean
  order: number
  memo: string | null
  createdAt: string
  updatedAt: string
}): Task {
  return {
    id: devTask.id,
    title: devTask.title,
    executionDate: devTask.executionDate ?? '',
    completed: devTask.completed,
    order: devTask.order,
    scheduledTime: null,
    recurrenceRule: null,
    recurrenceDaysOfWeek: null,
    recurrenceDayOfMonth: null,
    recurrenceEndDate: null,
    recurrenceExcludedDates: [],
    memo: devTask.memo,
    createdAt: devTask.createdAt,
    updatedAt: devTask.updatedAt,
  }
}

export function MorningOverdueStep({
  today,
  mode,
  execute,
}: MorningOverdueStepProps) {
  const todayStr = format(today, 'yyyy-MM-dd')
  const { tasks: lifeTasks, updateOverdueTasksToToday, updateTask } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const lifeOverdue = useMemo(() => {
    return lifeTasks.filter(
      (t) =>
        !t.completed &&
        t.executionDate != null &&
        t.executionDate !== '' &&
        t.executionDate < todayStr,
    )
  }, [lifeTasks, todayStr])

  const devOverdue = useMemo(() => {
    return devTasks.filter(
      (t) =>
        !t.completed &&
        t.executionDate != null &&
        t.executionDate < todayStr,
    )
  }, [devTasks, todayStr])

  const overdueTasks = mode === 'life' ? lifeOverdue : devOverdue.map(devTaskToTask)

  const getTargetLabel = (task: Task) => {
    if (mode !== 'development') return undefined
    const devTask = devTasks.find((t) => t.id === task.id)
    if (!devTask) return undefined
    return devTask.projectId
      ? projectNameById.get(devTask.projectId) ?? `プロジェクト#${devTask.projectId}`
      : devTask.type === 'learning'
        ? '学習'
        : 'Inbox'
  }

  const handleMoveAllToToday = async () => {
    if (mode === 'life') {
      await execute(
        async () => {
          const count = await updateOverdueTasksToToday()
          await mutate(SWR_KEYS.tasks)
          return count
        },
        '期限切れタスクの一括更新に失敗しました',
      )
    } else {
      await execute(
        async () => {
          const count = await updateAllOverdueDevTasksToToday()
          await mutate(SWR_KEYS.devTasks)
          return count
        },
        '期限切れタスクの一括更新に失敗しました',
      )
    }
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ) => {
    if (mode === 'life') {
      await execute(
        () => updateTask(task.id, { executionDate }),
        '実行日の更新に失敗しました',
      )
      await mutate(SWR_KEYS.tasks)
    } else {
      await execute(
        async () => {
          await updateDevTask(task.id, { executionDate })
          await mutate(SWR_KEYS.devTasks)
        },
        '実行日の更新に失敗しました',
      )
    }
  }

  if (overdueTasks.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="期限切れのタスクはありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        一括で今日に戻すか、各タスクの日付から個別に変更できます。
      </p>
      <Button type="button" onClick={handleMoveAllToToday}>
        一括で今日に戻す
      </Button>
      <TaskList
        tasks={overdueTasks}
        getTaskLabel={mode === 'development' ? getTargetLabel : undefined}
        dateLabelMode="overdue-only"
        onUpdateExecutionDate={handleUpdateExecutionDate}
      />
    </div>
  )
}
