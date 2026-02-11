import { parseISO, format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { formatHabitScheduledTime, type Habit } from '@/features/habits'
import type { Event } from '@/features/events'
import type { Task } from '@/lib/types/task'
import type { TimelineItemType } from '@/components/logs/TimelineItem'

function isValidTimeFormat(time: string | null): boolean {
  if (!time || time.trim() === '') return false
  const trimmed = time.trim()
  return /^\d{2}:\d{2}$/.test(trimmed)
}

function getEventTime(event: Event): string {
  if (event.allDay) return '00:00'
  const startDate = parseISO(event.startDatetime)
  const time = format(startDate, 'HH:mm', { locale: ja })
  return time !== '00:00' ? time : '00:00'
}

function getHabitTime(habit: Habit): string {
  if (!isValidTimeFormat(habit.scheduledTime)) return '00:00'
  return formatHabitScheduledTime(habit.scheduledTime)
}

function getTaskTime(task: Task): string {
  if (!task.scheduledTime) return '99:99'
  if (!isValidTimeFormat(task.scheduledTime)) return '99:99'
  return task.scheduledTime
}

function getSortKey(item: TimelineItemType): string {
  switch (item.type) {
    case 'event':
      return getEventTime(item.data)
    case 'habit':
      return getHabitTime(item.data)
    case 'task':
      return getTaskTime(item.data)
  }
}

export function createTimelineItems(
  events: Event[],
  habits: Habit[],
  tasks: Task[],
  completedHabitIds: Set<number>,
): TimelineItemType[] {
  const items: TimelineItemType[] = [
    ...events.map((event) => ({ type: 'event' as const, data: event })),
    ...habits.map((habit) => ({
      type: 'habit' as const,
      data: habit,
      completed: completedHabitIds.has(habit.id),
    })),
    ...tasks.map((task) => ({ type: 'task' as const, data: task })),
  ]

  return items.sort((a, b) => {
    const timeA = getSortKey(a)
    const timeB = getSortKey(b)
    return timeA.localeCompare(timeB)
  })
}
