import { getAllEvents, expandRecurringEvents } from '@/features/events'
import { getAllTasks } from '@/features/tasks'
import { expandRecurringTasks } from '@/features/tasks'
import { getAllHabits } from '@/features/habits'
import type { Event } from '@/features/events'
import type { Task } from '@/features/tasks'
import type { Habit, HabitFrequencyType } from '@/features/habits'
import type { UserSettings } from '@/features/settings'
import type { NotificationItem } from '../types/notification'
import { getTodayDateString } from '@/lib/date/formats'
import { startOfDay, endOfDay } from 'date-fns'

// Track sent notifications to avoid duplicates within a day
const sentNotifications = new Set<string>()
let lastResetDate = ''

function resetIfNewDay(): void {
  const today = getTodayDateString()
  if (today !== lastResetDate) {
    sentNotifications.clear()
    lastResetDate = today
  }
}

function buildNotificationKey(type: string, id: number, date: string): string {
  return `${type}-${id}-${date}`
}

function isHabitScheduledForToday(habit: Habit): boolean {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const dayOfMonth = now.getDate()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const freq: HabitFrequencyType = habit.frequencyType

  switch (freq) {
    case 'daily':
      return true
    case 'weekly': {
      // frequencyDays is comma-separated day numbers (0=Sun, 6=Sat)
      if (!habit.frequencyDays) return false
      const days = habit.frequencyDays.split(',').map((d) => parseInt(d.trim(), 10))
      return days.includes(dayOfWeek)
    }
    case 'monthly':
      return habit.frequencyDayOfMonth === dayOfMonth
    case 'monthly_last':
      return dayOfMonth === lastDayOfMonth
    case 'custom_days': {
      if (!habit.frequencyDays) return false
      const customDays = habit.frequencyDays.split(',').map((d) => parseInt(d.trim(), 10))
      return customDays.includes(dayOfWeek)
    }
    default:
      return false
  }
}

function parseTimeToTodayDate(timeStr: string): Date | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(match[1], 10), parseInt(match[2], 10), 0)
}

function parseDatetime(datetimeStr: string): Date | null {
  const d = new Date(datetimeStr)
  return Number.isNaN(d.getTime()) ? null : d
}

function isWithinNotificationWindow(
  targetTime: Date,
  now: Date,
  minutesBefore: number,
): boolean {
  const notifyAt = new Date(targetTime.getTime() - minutesBefore * 60 * 1000)
  // Window is 120s so that a 60s polling interval always hits at least once
  const diff = now.getTime() - notifyAt.getTime()
  return diff >= 0 && diff < 120 * 1000
}

export async function collectPendingNotifications(
  settings: UserSettings,
): Promise<NotificationItem[]> {
  resetIfNewDay()

  const items: NotificationItem[] = []
  const now = new Date()
  const today = getTodayDateString()
  const minutesBefore = settings.notifyMinutesBefore

  // Collect event notifications
  if (settings.notifyEvents) {
    try {
      const rawEvents: Event[] = await getAllEvents()
      const todayStart = startOfDay(now)
      const todayEnd = endOfDay(now)
      const events = expandRecurringEvents(rawEvents, todayStart, todayEnd)

      for (const event of events) {
        if (event.allDay) continue

        const startTime = parseDatetime(event.startDatetime)
        if (!startTime) continue

        // Only consider events starting today
        const eventDate = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}-${String(startTime.getDate()).padStart(2, '0')}`
        if (eventDate !== today) continue

        const key = buildNotificationKey('event', event.id, today)
        if (sentNotifications.has(key)) continue

        if (isWithinNotificationWindow(startTime, now, minutesBefore)) {
          items.push({
            id: key,
            type: 'event',
            title: event.title,
            scheduledTime: startTime,
          })
        }
      }
    } catch (err) {
      console.warn('[notifications] イベントの取得に失敗しました:', err)
    }
  }

  // Collect task notifications
  if (settings.notifyTasks) {
    try {
      const rawTasks: Task[] = await getAllTasks()
      const todayStart = startOfDay(now)
      const todayEnd = endOfDay(now)
      const tasks = expandRecurringTasks(rawTasks, todayStart, todayEnd)

      for (const task of tasks) {
        if (task.completed) continue
        if (task.executionDate !== today) continue
        if (!task.scheduledTime) continue

        const scheduledTime = parseTimeToTodayDate(task.scheduledTime)
        if (!scheduledTime) continue

        const key = buildNotificationKey('task', task.id, today)
        if (sentNotifications.has(key)) continue

        if (isWithinNotificationWindow(scheduledTime, now, minutesBefore)) {
          items.push({
            id: key,
            type: 'task',
            title: task.title,
            scheduledTime,
          })
        }
      }
    } catch (err) {
      console.warn('[notifications] タスクの取得に失敗しました:', err)
    }
  }

  // Collect habit notifications
  if (settings.notifyHabits) {
    try {
      const habits: Habit[] = await getAllHabits()
      for (const habit of habits) {
        if (!habit.scheduledTime) continue
        if (!isHabitScheduledForToday(habit)) continue

        const scheduledTime = parseTimeToTodayDate(habit.scheduledTime)
        if (!scheduledTime) continue

        const key = buildNotificationKey('habit', habit.id, today)
        if (sentNotifications.has(key)) continue

        if (isWithinNotificationWindow(scheduledTime, now, minutesBefore)) {
          items.push({
            id: key,
            type: 'habit',
            title: habit.name,
            scheduledTime,
          })
        }
      }
    } catch (err) {
      console.warn('[notifications] 習慣の取得に失敗しました:', err)
    }
  }

  return items
}

export function markAsSent(id: string): void {
  sentNotifications.add(id)
}

const TYPE_LABELS: Record<NotificationItem['type'], string> = {
  event: '予定',
  task: 'タスク',
  habit: '習慣',
}

export function formatNotificationBody(item: NotificationItem): string {
  const time = item.scheduledTime.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${time} - ${TYPE_LABELS[item.type]}`
}
