'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { startOfDay, endOfDay } from 'date-fns'
import { useDailyLog } from '../hooks/useDailyLog'
import { useHabitCompletionsByDate } from '@/features/habits'
import { expandRecurringEvents } from '@/features/events'
import { toTasksWithNextOccurrenceOnly } from '@/features/tasks'
import { isHabitDueOnDate } from '@/features/habits'
import { getTasksForDate, getEventsForDateSorted } from '../lib/utils'
import { createTimelineItems } from '../lib/timeline'
import { LogDiarySection } from './LogDiarySection'
import { TimelineSection } from './TimelineSection'
import type { UpdateDailyLogInput } from '../types/daily-log'
import type { Task } from '@/features/tasks'
import type { Event } from '@/features/events'
import type { Habit } from '@/features/habits'

interface LogDayContentProps {
  logDate: Date
  allTasks: Task[]
  allEvents: Event[]
  allHabits: Habit[]
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
  onToggleTask: (task: Task) => Promise<void>
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onEditEvent: (event: Event) => void
  onDeleteEvent: (event: Event) => void
}

export function LogDayContent({
  logDate,
  allTasks,
  allEvents,
  allHabits,
  execute,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onEditEvent,
  onDeleteEvent,
}: LogDayContentProps) {
  const dateStr = format(logDate, 'yyyy-MM-dd')

  const {
    dailyLog,
    isLoading: isLoadingDailyLog,
    createDailyLog,
    updateDailyLog,
  } = useDailyLog(dateStr)

  const {
    completions: habitCompletions,
    createCompletion: createHabitCompletion,
    deleteCompletion: deleteHabitCompletion,
  } = useHabitCompletionsByDate(dateStr)

  const tasks = useMemo(() => {
    const withNextOnly = toTasksWithNextOccurrenceOnly(allTasks, logDate)
    return getTasksForDate(withNextOnly, logDate)
  }, [allTasks, logDate])

  const events = useMemo(() => {
    const rangeStart = startOfDay(logDate)
    const rangeEnd = endOfDay(logDate)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return getEventsForDateSorted(expanded, logDate)
  }, [allEvents, logDate])

  const habitsForDate = useMemo(
    () => allHabits.filter((h) => isHabitDueOnDate(h, logDate)),
    [allHabits, logDate],
  )

  const completedHabitIds = useMemo(
    () => new Set(habitCompletions.map((c) => c.habitId)),
    [habitCompletions],
  )

  const timelineItems = useMemo(
    () => createTimelineItems(events, habitsForDate, tasks, completedHabitIds),
    [events, habitsForDate, tasks, completedHabitIds],
  )

  const handleUpdateDiary = async (input: UpdateDailyLogInput) => {
    await execute(
      async () => {
        if (dailyLog) {
          await updateDailyLog(input)
        } else {
          await createDailyLog({ logDate: dateStr, diary: input.diary })
        }
      },
      '日記の保存に失敗しました',
    )
  }

  const handleToggleHabit = async (habit: { id: number }) => {
    const completed = completedHabitIds.has(habit.id)
    await execute(
      async () => {
        if (completed) {
          await deleteHabitCompletion(habit.id, dateStr)
        } else {
          await createHabitCompletion(habit.id, dateStr)
        }
      },
      '習慣の完了状態の更新に失敗しました',
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <LogDiarySection
          dailyLog={dailyLog}
          isLoading={isLoadingDailyLog}
          onUpdate={handleUpdateDiary}
        />
      </div>
      <div className="space-y-6">
        <TimelineSection
        items={timelineItems}
        events={events}
        habits={habitsForDate}
        tasks={tasks}
        completedHabitIds={completedHabitIds}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
        onToggleHabit={handleToggleHabit}
        onToggleTask={onToggleTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        />
      </div>
    </div>
  )
}
