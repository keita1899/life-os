import { getDay, getDate, endOfMonth, isSameDay } from 'date-fns'
import type { Habit } from '../types/habit'

export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  switch (habit.frequencyType) {
    case 'daily':
      return true
    case 'weekly': {
      const dayStr = habit.frequencyDays?.trim()
      if (!dayStr) return false
      const day = parseInt(dayStr, 10)
      if (Number.isNaN(day) || day < 0 || day > 6) return false
      return getDay(date) === day
    }
    case 'monthly': {
      const dayOfMonth = habit.frequencyDayOfMonth
      if (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31)
        return false
      return getDate(date) === dayOfMonth
    }
    case 'monthly_last':
      return isSameDay(date, endOfMonth(date))
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
