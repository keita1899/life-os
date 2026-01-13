import { startOfWeek } from 'date-fns'

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
    return weekStart.toISOString().split('T')[0]
  }
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  return weekStart.toISOString().split('T')[0]
}
