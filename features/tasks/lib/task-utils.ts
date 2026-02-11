import { WEEKDAY_LABELS } from '@/features/events'
import type { Task } from '../types/task'

export function getRecurrenceLabel(task: Task): string {
  if (!task.recurrenceRule) return ''
  if (task.recurrenceRule === 'daily') return '毎日'
  if (task.recurrenceRule === 'weekly') {
    const days = task.recurrenceDaysOfWeek
    if (days?.length) {
      const labels = days.map((d) => WEEKDAY_LABELS[d]).join('・')
      return `毎週 ${labels} 曜日`
    }
    return '毎週'
  }
  if (task.recurrenceRule === 'monthly') {
    const dom = task.recurrenceDayOfMonth
    if (dom === 0) return '毎月末'
    if (dom != null) return `毎月${dom}日`
    return '毎月'
  }
  return ''
}

export const DATE_LABEL_STYLES: Record<string, string> = {
  today: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  tomorrow: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  future: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
}

export const DEFAULT_DATE_STYLE =
  'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
