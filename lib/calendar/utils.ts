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
  parseISO,
  isWithinInterval,
} from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { Event } from '@/lib/types/event'

export const weekdays = ['月', '火', '水', '木', '金', '土', '日'] as const

export function getWeekdays(weekStartDay: number = 0): readonly string[] {
  if (weekStartDay === 0) {
    return ['日', '月', '火', '水', '木', '金', '土'] as const
  }
  return weekdays
}

export function getCalendarDays(date: Date, weekStartDay: number = 0): Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const weekStartsOn = (weekStartDay === 0 ? 0 : 1) as 0 | 1
  const calendarStart = startOfWeek(monthStart, { weekStartsOn })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn })

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

export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1)
}

export function getWeekStartDate(date: Date, weekStartDay: number = 0): Date {
  const weekStartsOn = (weekStartDay === 0 ? 0 : 1) as 0 | 1
  return startOfWeek(date, { weekStartsOn })
}

export function getWeekDays(date: Date, weekStartDay: number = 0): Date[] {
  const weekStartsOn = (weekStartDay === 0 ? 0 : 1) as 0 | 1
  const weekStart = startOfWeek(date, { weekStartsOn })
  const weekEnd = endOfWeek(date, { weekStartsOn })

  return eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  })
}

export function formatWeekRange(date: Date, weekStartDay: number = 0): string {
  const weekStartsOn = (weekStartDay === 0 ? 0 : 1) as 0 | 1
  const weekStart = startOfWeek(date, { weekStartsOn })
  const weekEnd = endOfWeek(date, { weekStartsOn })
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

export function getEventsForDate(events: Event[], date: Date): Event[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dateStart = new Date(dateStr + 'T00:00:00')
  const dateEnd = new Date(dateStr + 'T23:59:59')

  return events.filter((event) => {
    const eventStart = parseISO(event.startDatetime)
    const eventStartDate = format(eventStart, 'yyyy-MM-dd')

    if (event.allDay) {
      if (event.endDatetime) {
        const eventEnd = parseISO(event.endDatetime)
        const eventEndDate = format(eventEnd, 'yyyy-MM-dd')
        return (
          (dateStr >= eventStartDate && dateStr <= eventEndDate) ||
          (dateStr >= eventEndDate && dateStr <= eventStartDate)
        )
      }
      return eventStartDate === dateStr
    }

    if (event.endDatetime) {
      const eventEnd = parseISO(event.endDatetime)
      return (
        isWithinInterval(dateStart, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(dateEnd, { start: eventStart, end: eventEnd }) ||
        (eventStart <= dateStart && eventEnd >= dateEnd)
      )
    }

    return eventStartDate === dateStr
  })
}

export function formatEventTime(event: Event): string {
  if (event.allDay) {
    return '終日'
  }

  const startDate = parseISO(event.startDatetime)
  const startTime = format(startDate, 'HH:mm')

  if (event.endDatetime) {
    const endDate = parseISO(event.endDatetime)
    const endTime = format(endDate, 'HH:mm')
    if (startTime === '00:00' && endTime === '00:00') {
      return ''
    }
    return `${startTime} - ${endTime}`
  }

  if (startTime === '00:00') {
    return ''
  }
  return startTime
}

export function sortEventsByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.allDay && !b.allDay) {
      return -1
    }
    if (!a.allDay && b.allDay) {
      return 1
    }
    if (a.allDay && b.allDay) {
      return a.title.localeCompare(b.title)
    }

    const aStart = parseISO(a.startDatetime)
    const bStart = parseISO(b.startDatetime)
    return aStart.getTime() - bStart.getTime()
  })
}
