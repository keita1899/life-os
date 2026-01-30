import { getDay } from 'date-fns'
import type { Habit } from '../types/habit'

export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  switch (habit.frequencyType) {
    case 'daily':
      return true
    case 'custom_days': {
      const daysStr = habit.frequencyDays?.trim()
      if (!daysStr) return false
      const days = daysStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
      if (days.length === 0) return false
      return days.includes(getDay(date))
    }
    default:
      return false
  }
}
