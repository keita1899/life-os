import {
  addDays,
  addMonths,
  isBefore,
  parseISO,
  format,
  startOfDay,
  getDay,
  getDate,
  setDate,
  getDaysInMonth,
  isAfter,
} from 'date-fns'
import type { Task } from '@/lib/types/task'
import type { RecurrenceRule } from '@/lib/types/event'

function getOccurrenceDates(
  rule: RecurrenceRule,
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
  recurrenceEndDate: string | null,
  daysOfWeek: number[] | null,
  dayOfMonth: number | null,
  excludedDates: string[] = [],
): Date[] {
  const endLimit = recurrenceEndDate
    ? parseISO(recurrenceEndDate + 'T23:59:59')
    : null
  const excludedDatesSet = new Set(excludedDates)
  const dates: Date[] = []

  if (rule === 'daily') {
    let current = startOfDay(startDate)
    while (isBefore(current, rangeStart)) {
      if (endLimit && isAfter(current, endLimit)) return dates
      current = addDays(current, 1)
    }
    while (!isAfter(current, rangeEnd)) {
      if (endLimit && isAfter(current, endLimit)) break
      const dateStr = format(current, 'yyyy-MM-dd')
      if (!excludedDatesSet.has(dateStr)) {
        dates.push(new Date(current))
      }
      current = addDays(current, 1)
    }
    return dates
  }

  if (rule === 'weekly') {
    const targetDays =
      (daysOfWeek?.length ?? 0) > 0 ? daysOfWeek! : [getDay(startDate)]
    const weekStart = startOfDay(startDate)
    const weekStartDay = getDay(weekStart)

    for (const targetDay of targetDays) {
      let diff = targetDay - weekStartDay
      if (diff < 0) diff += 7
      let current = addDays(weekStart, diff)

      while (isBefore(current, rangeStart)) {
        if (endLimit && isAfter(current, endLimit)) break
        current = addDays(current, 7)
      }
      while (!isAfter(current, rangeEnd)) {
        if (endLimit && isAfter(current, endLimit)) break
        const dateStr = format(current, 'yyyy-MM-dd')
        if (!excludedDatesSet.has(dateStr)) {
          dates.push(new Date(current))
        }
        current = addDays(current, 7)
      }
    }
    dates.sort((a, b) => a.getTime() - b.getTime())
    return dates
  }

  if (rule === 'monthly') {
    const rawDom = dayOfMonth ?? getDate(startDate)
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

    const clampToMonth = (d: Date, dom: number): Date => {
      const max = getDaysInMonth(d)
      const target = dom === 0 ? max : Math.min(dom, max)
      return setDate(d, target)
    }

    current = clampToMonth(current, rawDom)
    if (isBefore(current, startOfDay(startDate))) {
      current = addMonths(current, 1)
      current = clampToMonth(current, rawDom)
    }

    while (isBefore(current, rangeStart)) {
      if (endLimit && isAfter(current, endLimit)) return dates
      current = addMonths(current, 1)
      current = clampToMonth(current, rawDom)
    }
    while (!isAfter(current, rangeEnd)) {
      if (endLimit && isAfter(current, endLimit)) break
      const dateStr = format(current, 'yyyy-MM-dd')
      if (!excludedDatesSet.has(dateStr)) {
        dates.push(new Date(current))
      }
      current = addMonths(current, 1)
      current = clampToMonth(current, rawDom)
    }
    return dates
  }

  return dates
}

function getOccurrenceDatesUpTo(
  rule: RecurrenceRule,
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
  recurrenceEndDate: string | null,
  daysOfWeek: number[] | null,
  dayOfMonth: number | null,
  excludedDates: string[] = [],
): Date[] {
  return getOccurrenceDates(
    rule,
    startDate,
    rangeStart,
    rangeEnd,
    recurrenceEndDate,
    daysOfWeek,
    dayOfMonth,
    excludedDates,
  )
}

export function getNextOccurrenceDate(
  task: Task,
  fromDate: Date,
): string | null {
  if (!task.recurrenceRule || !task.executionDate) return null
  const startDate = parseISO(task.executionDate)
  const rangeStart = startOfDay(fromDate)
  const endLimit = task.recurrenceEndDate
    ? parseISO(task.recurrenceEndDate + 'T23:59:59')
    : null
  const rangeEnd = endLimit
    ? endLimit
    : startOfDay(addMonths(fromDate, 12))
  const dates = getOccurrenceDatesUpTo(
    task.recurrenceRule,
    startDate,
    rangeStart,
    rangeEnd,
    task.recurrenceEndDate,
    task.recurrenceDaysOfWeek,
    task.recurrenceDayOfMonth,
    task.recurrenceExcludedDates || [],
  )
  return dates.length > 0 ? format(dates[0], 'yyyy-MM-dd') : null
}

export function getNextOccurrenceAfter(
  task: Task,
  afterDate: Date,
): string | null {
  if (!task.recurrenceRule || !task.executionDate) return null
  const startDate = parseISO(task.executionDate)
  const rangeStart = startOfDay(addDays(afterDate, 1))
  const endLimit = task.recurrenceEndDate
    ? parseISO(task.recurrenceEndDate + 'T23:59:59')
    : null
  const rangeEnd = endLimit
    ? endLimit
    : startOfDay(addMonths(afterDate, 13))
  const dates = getOccurrenceDatesUpTo(
    task.recurrenceRule,
    startDate,
    rangeStart,
    rangeEnd,
    task.recurrenceEndDate,
    task.recurrenceDaysOfWeek,
    task.recurrenceDayOfMonth,
    task.recurrenceExcludedDates || [],
  )
  return dates.length > 0 ? format(dates[0], 'yyyy-MM-dd') : null
}

export function toTasksWithNextOccurrenceOnly(
  tasks: Task[],
  fromDate: Date,
): Task[] {
  const fromDay = startOfDay(fromDate)
  const result: Task[] = []

  for (const task of tasks) {
    if (!task.recurrenceRule || !task.executionDate) {
      result.push(task)
      continue
    }

    const nextDate = getNextOccurrenceDate(task, fromDay)
    if (!nextDate) continue

    result.push({
      ...task,
      executionDate: nextDate,
    })
  }

  return result
}

export function expandRecurringTasks(
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date,
): Task[] {
  const rangeStartDay = startOfDay(rangeStart)
  const rangeEndDay = startOfDay(addDays(rangeEnd, 1))

  const result: Task[] = []

  for (const task of tasks) {
    if (!task.recurrenceRule || !task.executionDate) {
      result.push(task)
      continue
    }

    const startDate = parseISO(task.executionDate)
    const occurrenceDates = getOccurrenceDates(
      task.recurrenceRule,
      startDate,
      rangeStartDay,
      rangeEndDay,
      task.recurrenceEndDate,
      task.recurrenceDaysOfWeek,
      task.recurrenceDayOfMonth,
      task.recurrenceExcludedDates || [],
    )

    for (const occDate of occurrenceDates) {
      const occExecutionDate = format(occDate, 'yyyy-MM-dd')
      result.push({
        ...task,
        executionDate: occExecutionDate,
      })
    }
  }

  return result
}
