'use client'

import { useMemo } from 'react'
import { mutate } from 'swr'
import { useTasks, TaskList } from '@/features/tasks'
import { useDevCalendarTasks, updateDevTask, updateAllOverdueDevTasksToToday } from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SWR_KEYS } from '@/lib/swr-keys'
import { useReviewTaskCrud } from '../../hooks/useReviewTaskCrud'
import { ReviewTaskDialogs } from '../ReviewTaskDialogs'
import { devTaskToTask } from '../../lib/devTaskToTask'
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

export function MorningOverdueStep({
  today,
  mode,
  execute,
}: MorningOverdueStepProps) {
  const todayStr = format(today, 'yyyy-MM-dd')
  const { tasks: lifeTasks, updateOverdueTasksToToday, updateTask } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const crud = useReviewTaskCrud(mode)

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
      <TaskList
        tasks={overdueTasks}
        getTaskLabel={mode === 'development' ? getTargetLabel : undefined}
        dateLabelMode="overdue-only"
        onUpdateExecutionDate={handleUpdateExecutionDate}
        onToggleCompletion={crud.handleToggleCompletion}
        onEdit={crud.handleEdit}
        onDelete={crud.handleDelete}
      />
      <div className="flex justify-end">
        <Button type="button" onClick={handleMoveAllToToday}>
          一括で今日に戻す
        </Button>
      </div>
      <ReviewTaskDialogs
        editingTask={crud.editingTask}
        deletingTask={crud.deletingTask}
        onEditClose={() => crud.setEditingTask(null)}
        onEditSubmit={crud.handleEditSubmit}
        onRecurringDeleteConfirm={crud.handleRecurringDeleteConfirm}
        onDeleteCancel={() => crud.setDeletingTask(null)}
      />
    </div>
  )
}
