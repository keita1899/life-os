import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'

export const DATE_FORMATS = {
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  DISPLAY_DATE: 'yyyy年M月d日(E)',
  DISPLAY_DATETIME: 'yyyy年M月d日(E) HH:mm',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_MONTH_DAY: 'M/d(E)',
} as const

export function formatDateISO(date: Date): string {
  return format(date, DATE_FORMATS.ISO_DATE)
}

export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, DATE_FORMATS.DISPLAY_DATE, { locale: ja })
}

export function formatDateTimeDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, DATE_FORMATS.DISPLAY_DATETIME, { locale: ja })
}

export function formatTimeDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, DATE_FORMATS.DISPLAY_TIME)
}

export function formatMonthDayDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, DATE_FORMATS.DISPLAY_MONTH_DAY, { locale: ja })
}

export function getTodayDate(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function getTodayDateString(): string {
  return formatDateISO(getTodayDate())
}

export function getTomorrowDate(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

export function getTomorrowDateString(): string {
  return formatDateISO(getTomorrowDate())
}

export function parseDateString(dateStr: string): Date {
  const date = parseISO(dateStr)
  date.setHours(0, 0, 0, 0)
  return date
}

export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseDateString(date1) : date1
  const d2 = typeof date2 === 'string' ? parseDateString(date2) : date2
  return formatDateISO(d1) === formatDateISO(d2)
}

export function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = parseDateString(dateStr)
  return formatDateISO(date)
}
