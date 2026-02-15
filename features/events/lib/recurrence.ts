import {
  addDays,
  addMonths,
  isBefore,
  parseISO,
  format,
  startOfDay,
  setHours,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  getSeconds,
  getDay,
  getDate,
  setDate,
  getDaysInMonth,
  isAfter,
} from 'date-fns'
import type { Event, RecurrenceRule } from '../types/event'

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

function shiftDatetimeToDate(
  originalDatetime: string,
  occurrenceDate: Date,
  allDay: boolean,
): string {
  const original = parseISO(originalDatetime)
  if (allDay) {
    return format(occurrenceDate, 'yyyy-MM-dd') + 'T00:00:00'
  }
  const withTime = setSeconds(
    setMinutes(setHours(occurrenceDate, getHours(original)), getMinutes(original)),
    getSeconds(original),
  )
  return format(withTime, "yyyy-MM-dd'T'HH:mm:ss")
}

export function expandRecurringEvents(
  events: Event[],
  rangeStart: Date,
  rangeEnd: Date,
): Event[] {
  const rangeStartDay = startOfDay(rangeStart)
  const rangeEndDay = startOfDay(addDays(rangeEnd, 1))

  const result: Event[] = []

  for (const event of events) {
    if (!event.recurrenceRule) {
      result.push(event)
      continue
    }

    const startDate = parseISO(event.startDatetime)
    const occurrenceDates = getOccurrenceDates(
      event.recurrenceRule,
      startDate,
      rangeStartDay,
      rangeEndDay,
      event.recurrenceEndDate,
      event.recurrenceDaysOfWeek,
      event.recurrenceDayOfMonth,
      event.recurrenceExcludedDates || [],
    )

    const durationMs = event.endDatetime
      ? parseISO(event.endDatetime).getTime() - startDate.getTime()
      : 0

    for (const occDate of occurrenceDates) {
      const occStart = shiftDatetimeToDate(
        event.startDatetime,
        occDate,
        event.allDay,
      )
      const occEnd = event.endDatetime
        ? shiftDatetimeToDate(event.endDatetime, occDate, event.allDay)
        : event.allDay
        ? format(occDate, 'yyyy-MM-dd') + 'T23:59:59'
        : null
      if (durationMs > 0 && occEnd) {
        const occEndDate = new Date(parseISO(occStart).getTime() + durationMs)
        result.push({
          ...event,
          startDatetime: occStart,
          endDatetime: format(occEndDate, "yyyy-MM-dd'T'HH:mm:ss"),
        })
      } else {
        result.push({
          ...event,
          startDatetime: occStart,
          endDatetime: occEnd,
        })
      }
    }
  }

  return result
}
