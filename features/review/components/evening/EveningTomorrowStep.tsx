'use client'

import { useMemo, useCallback } from 'react'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { useEvents } from '@/features/events'
import { expandRecurringEvents } from '@/features/events'
import { useTasks } from '@/features/tasks'
import { toTasksWithNextOccurrenceOnly, getTasksForDate } from '@/features/tasks'
import { useDevCalendarTasks, type DevTask } from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { getEventsForDateSorted } from '@/features/logs'
import { getDevTasksForDate } from '@/features/dev/logs'
import { LogEventsSection } from '@/features/logs'
import { TaskList } from '@/features/tasks'
import type { Task } from '@/features/tasks'
import type { ReviewMode } from '../../types/review-completion'

interface EveningTomorrowStepProps {
  today: Date
  mode: ReviewMode
}

function devTaskToTask(devTask: DevTask): Task {
  return {
    id: devTask.id,
    title: devTask.title,
    executionDate: devTask.executionDate,
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

export function EveningTomorrowStep({ today, mode }: EveningTomorrowStepProps) {
  const tomorrow = useMemo(() => addDays(today, 1), [today])

  const { events: allEvents } = useEvents()
  const { tasks: lifeTasks } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const lifeEvents = useMemo(() => {
    const rangeStart = startOfDay(tomorrow)
    const rangeEnd = endOfDay(tomorrow)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return getEventsForDateSorted(expanded, tomorrow)
  }, [allEvents, tomorrow])

  const lifeTasksTomorrow = useMemo(() => {
    const withNextOnly = toTasksWithNextOccurrenceOnly(lifeTasks, tomorrow)
    return getTasksForDate(withNextOnly, tomorrow)
  }, [lifeTasks, tomorrow])

  const devTaskById = useMemo(() => {
    const map = new Map<number, DevTask>()
    devTasks.forEach((t) => map.set(t.id, t))
    return map
  }, [devTasks])

  const devTasksTomorrow = useMemo(() => {
    const devForDate = getDevTasksForDate(devTasks, tomorrow)
    return devForDate.map(devTaskToTask)
  }, [devTasks, tomorrow])

  const tasks = mode === 'life' ? lifeTasksTomorrow : devTasksTomorrow

  const computeTaskLabel = useCallback(
    (task: Task): string | undefined => {
      if (mode !== 'development') return undefined
      const devTask = devTaskById.get(task.id)
      if (!devTask) return undefined
      return devTask.projectId
        ? projectNameById.get(devTask.projectId) ?? `プロジェクト#${devTask.projectId}`
        : devTask.type === 'learning'
          ? '学習'
          : 'Inbox'
    },
    [mode, devTaskById, projectNameById],
  )

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <TaskList
          tasks={tasks}
          getTaskLabel={computeTaskLabel}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <LogEventsSection events={lifeEvents} />
      <TaskList tasks={tasks} />
    </div>
  )
}
