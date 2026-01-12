import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getYear,
  getMonth,
} from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'

export const weekdays = ['月', '火', '水', '木', '金', '土', '日'] as const

export function getCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })
}

export function formatMonthYear(date: Date): string {
  return format(date, 'yyyy年M月', { locale: ja })
}

export function formatDay(date: Date): string {
  return format(date, 'd', { locale: ja })
}

export function formatWeekday(date: Date): string {
  return format(date, 'E', { locale: ja })
}

export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return isSameMonth(date, currentDate)
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getMonthlyGoalsForDate(
  goals: MonthlyGoal[],
  date: Date,
): MonthlyGoal[] {
  const year = getYear(date)
  const month = getMonth(date) + 1

  return goals.filter((goal) => goal.year === year && goal.month === month)
}

export function getGoalsForDate(
  goals: MonthlyGoal[],
  date: Date,
): MonthlyGoal[] {
  const year = getYear(date)
  const month = getMonth(date) + 1
  const day = date.getDate()

  return goals.filter((goal) => {
    if (goal.year !== year || goal.month !== month) {
      return false
    }

    if (!goal.targetDate) {
      return false
    }

    const targetDate = new Date(goal.targetDate)
    return (
      targetDate.getFullYear() === year &&
      targetDate.getMonth() + 1 === month &&
      targetDate.getDate() === day
    )
  })
}

export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1)
}

export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

  return eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  })
}

export function formatWeekRange(date: Date): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  const startMonth = getMonth(weekStart) + 1
  const endMonth = getMonth(weekEnd) + 1
  const startYear = getYear(weekStart)
  const endYear = getYear(weekEnd)

  if (startYear === endYear && startMonth === endMonth) {
    return `${startYear}年${startMonth}月 ${format(weekStart, 'd', {
      locale: ja,
    })}日 - ${format(weekEnd, 'd', { locale: ja })}日`
  }

  if (startYear === endYear) {
    return `${startYear}年${startMonth}月${format(weekStart, 'd', {
      locale: ja,
    })}日 - ${endMonth}月${format(weekEnd, 'd', { locale: ja })}日`
  }

  return `${startYear}年${startMonth}月${format(weekStart, 'd', {
    locale: ja,
  })}日 - ${endYear}年${endMonth}月${format(weekEnd, 'd', { locale: ja })}日`
}

export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1)
}

export function getGoalsForWeek(
  goals: MonthlyGoal[],
  weekStart: Date,
): MonthlyGoal[] {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const weekDays = getWeekDays(weekStart)

  return goals.filter((goal) => {
    if (!goal.targetDate) {
      return false
    }

    const targetDate = new Date(goal.targetDate)
    return weekDays.some(
      (day) =>
        day.getFullYear() === targetDate.getFullYear() &&
        day.getMonth() === targetDate.getMonth() &&
        day.getDate() === targetDate.getDate(),
    )
  })
}
