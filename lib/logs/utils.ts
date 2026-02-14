import { getYear, getMonth, startOfWeek } from 'date-fns'
import { getEventsForDate, sortEventsByTime } from '@/features/events'
import { formatDateISO } from '../date/formats'
import type { YearlyGoal, MonthlyGoal, WeeklyGoal } from '@/features/goals'
import type { Event } from '@/features/events'

export function getYearlyGoalsForDate(
  goals: YearlyGoal[],
  date: Date,
): YearlyGoal[] {
  const year = getYear(date)
  return goals.filter((goal) => goal.year === year)
}

export function getMonthlyGoalsForDate(
  goals: MonthlyGoal[],
  date: Date,
): MonthlyGoal[] {
  const year = getYear(date)
  const month = getMonth(date) + 1
  return goals.filter((goal) => goal.year === year && goal.month === month)
}

export function getWeeklyGoalsForDate(
  goals: WeeklyGoal[],
  date: Date,
): WeeklyGoal[] {
  const weekStartsOn = 1
  const weekStart = startOfWeek(date, { weekStartsOn })
  weekStart.setHours(0, 0, 0, 0)
  const weekStartDate = formatDateISO(weekStart)
  
  return goals.filter((goal) => goal.weekStartDate === weekStartDate)
}

export { getTasksForDate } from '@/features/tasks'
export { getSubscriptionsForDate } from '@/features/subscriptions'

export function getEventsForDateSorted(
  events: Event[],
  date: Date,
): Event[] {
  return sortEventsByTime(getEventsForDate(events, date))
}
