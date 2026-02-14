'use client'

import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { useDevDailyLog } from '../../hooks/useDevDailyLog'
import { getDevTasksForDate } from '../../lib/dev/utils'
import { DevLogReportSection } from './DevLogReportSection'
import { DevLogTasksSection } from './DevLogTasksSection'
import type { DevTask } from '@/features/dev/tasks'
import type { Task } from '@/features/tasks'
import type { DevProject } from '@/features/dev/projects'

interface DevLogDayContentProps {
  logDate: Date
  allDevTasks: DevTask[]
  projects: DevProject[]
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
  onToggleTask: (task: Task) => Promise<void>
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onUpdateExecutionDate: (task: Task, executionDate: string | null) => Promise<void>
}

function mapDevTaskToTask(devTask: DevTask): Task {
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

export function DevLogDayContent({
  logDate,
  allDevTasks,
  projects,
  execute,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onUpdateExecutionDate,
}: DevLogDayContentProps) {
  const dateStr = format(logDate, 'yyyy-MM-dd')

  const {
    devDailyLog,
    isLoading: isLoadingDailyLog,
    createDevDailyLog,
    updateDevDailyLog,
  } = useDevDailyLog(dateStr)

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const devTasksForDate = useMemo(
    () => getDevTasksForDate(allDevTasks, logDate),
    [allDevTasks, logDate],
  )

  const tasks: Task[] = useMemo(
    () => devTasksForDate.map(mapDevTaskToTask),
    [devTasksForDate],
  )

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

  const handleUpdateReport = async (input: { report?: string | null }) => {
    await execute(
      async () => {
        if (devDailyLog) {
          await updateDevDailyLog(input)
        } else {
          await createDevDailyLog({ logDate: dateStr, report: input.report })
        }
      },
      '日報の保存に失敗しました',
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
      <DevLogReportSection
        devDailyLog={devDailyLog}
        isLoading={isLoadingDailyLog}
        onUpdate={handleUpdateReport}
      />
      <DevLogTasksSection
        tasks={tasks}
        getTargetLabel={getTaskTargetLabel}
        onToggleCompletion={onToggleTask}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onUpdateExecutionDate={onUpdateExecutionDate}
      />
    </div>
  )
}
