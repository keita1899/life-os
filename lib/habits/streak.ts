import { subDays } from 'date-fns'
import { formatDateISO } from '../date/formats'
import { isHabitDueOnDate } from './frequency'
import type { Habit } from '../types/habit'
import type { HabitCompletion } from '../types/habit-completion'

export function calcHabitStreak(
  habit: Habit,
  completions: HabitCompletion[],
  asOfDate: Date,
): number {
  const completedSet = new Set(completions.map((c) => c.completedDate))
  let streak = 0
  let date = new Date(asOfDate)
  date.setHours(0, 0, 0, 0)
  const maxDays = 366
  for (let i = 0; i < maxDays; i++) {
    if (!isHabitDueOnDate(habit, date)) {
      date = subDays(date, 1)
      continue
    }
    const dateStr = formatDateISO(date)
    if (completedSet.has(dateStr)) {
      streak++
      date = subDays(date, 1)
    } else {
      break
    }
  }
  return streak
}
