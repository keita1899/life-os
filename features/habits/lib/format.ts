import type { Habit } from '../types/habit'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

export function formatHabitFrequency(habit: Habit): string {
  switch (habit.frequencyType) {
    case 'daily':
      return '毎日'
    case 'custom_days': {
      const daysStr = habit.frequencyDays?.trim()
      if (!daysStr) return '曜日指定'
      const days = daysStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
      if (days.length === 0) return '曜日指定'
      return days.map((d) => DAY_LABELS[d]).join('・')
    }
    default:
      return ''
  }
}

export function formatHabitScheduledTime(scheduledTime: string | null): string {
  if (!scheduledTime) return ''
  const parts = scheduledTime.trim().split(':')
  if (parts.length >= 2) {
    const h = parts[0].padStart(2, '0')
    const m = parts[1].padStart(2, '0')
    return `${h}:${m}`
  }
  return scheduledTime
}
