import { startOfWeek } from 'date-fns'
import { formatDateISO } from '../date/formats'

export function getYearFromDate(date: string | null | undefined): number {
  if (date) {
    const parsed = new Date(date)
    const year = parsed.getFullYear()
    return Number.isNaN(year) ? new Date().getFullYear() : year
  }
  return new Date().getFullYear()
}

export function getMonthFromDate(date: string | null | undefined): number {
  if (date) {
    const parsed = new Date(date)
    const month = parsed.getMonth()
    return Number.isNaN(month) ? new Date().getMonth() + 1 : month + 1
  }
  return new Date().getMonth() + 1
}

export function getWeekStartDateFromDate(
  date: string | null | undefined,
): string {
  if (date) {
    const parsed = new Date(date)
    const weekStart = startOfWeek(parsed, { weekStartsOn: 1 })
    weekStart.setHours(0, 0, 0, 0)
    return formatDateISO(weekStart)
  }
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  weekStart.setHours(0, 0, 0, 0)
  return formatDateISO(weekStart)
}
