'use client'

import { useMemo } from 'react'
import { useTasks, getTasksCompletedInWeek, TaskList } from '@/features/tasks'
import { useDevCalendarTasks, getDevTasksCompletedInWeek } from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { EmptyState } from '@/components/ui/empty-state'
import { useReviewTaskCrud } from '../../hooks/useReviewTaskCrud'
import { ReviewTaskDialogs } from '../ReviewTaskDialogs'
import { devTaskToTask } from '../../lib/devTaskToTask'
import type { Task } from '@/features/tasks'
import type { ReviewMode } from '../../types/review-completion'

interface WeekEndCompletedTasksStepProps {
  weekStartDateStr: string
  weekEndDateStr: string
  mode: ReviewMode
}

export function WeekEndCompletedTasksStep({
  weekStartDateStr,
  weekEndDateStr,
  mode,
}: WeekEndCompletedTasksStepProps) {
  const { tasks: lifeTasks } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const crud = useReviewTaskCrud(mode)

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const lifeCompleted = useMemo(
    () =>
      getTasksCompletedInWeek(lifeTasks, weekStartDateStr, weekEndDateStr),
    [lifeTasks, weekStartDateStr, weekEndDateStr],
  )
  const devCompleted = useMemo(
    () =>
      getDevTasksCompletedInWeek(devTasks, weekStartDateStr, weekEndDateStr),
    [devTasks, weekStartDateStr, weekEndDateStr],
  )

  const tasks = mode === 'life' ? lifeCompleted : devCompleted.map(devTaskToTask)

  const getTaskLabel = (task: Task) => {
    if (mode !== 'development') return undefined
    const devTask = devTasks.find((t) => t.id === task.id)
    if (!devTask) return undefined
    return devTask.projectId
      ? projectNameById.get(devTask.projectId) ?? `プロジェクト#${devTask.projectId}`
      : devTask.type === 'learning'
        ? '学習'
        : 'Inbox'
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="今週の完了タスクはありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <TaskList
        tasks={tasks}
        getTaskLabel={mode === 'development' ? getTaskLabel : undefined}
        dateLabelMode="all"
        onToggleCompletion={crud.handleToggleCompletion}
        onEdit={crud.handleEdit}
        onDelete={crud.handleDelete}
        onUpdateExecutionDate={crud.handleUpdateExecutionDate}
      />
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
