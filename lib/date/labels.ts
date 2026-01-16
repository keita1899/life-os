import { parseISO } from 'date-fns'
import {
  getTodayDate,
  getTomorrowDate,
  getTodayDateString,
  getTomorrowDateString,
  parseDateString,
  formatMonthDayDisplay,
  formatDateDisplay,
} from './formats'

export type DateLabelType = 'today' | 'tomorrow' | 'overdue' | 'future'

export interface DateLabel {
  text: string
  type: DateLabelType
}

export function getDateLabel(dateStr: string | null | undefined): DateLabel | null {
  if (!dateStr) return null

  const today = getTodayDate()
  const tomorrow = getTomorrowDate()
  const todayStr = getTodayDateString()
  const tomorrowStr = getTomorrowDateString()

  const date = parseDateString(dateStr)

  if (dateStr === todayStr) {
    return { text: '今日', type: 'today' }
  }
  if (dateStr === tomorrowStr) {
    return { text: '明日', type: 'tomorrow' }
  }
  if (date < today) {
    return { text: '期限切れ', type: 'overdue' }
  }

  return { text: formatMonthDayDisplay(dateStr), type: 'future' }
}

export function categorizeDate(
  dateStr: string | null | undefined,
  todayStr: string,
  tomorrowStr: string,
  today: Date,
): 'today' | 'tomorrow' | 'overdue' | 'future' | 'none' {
  if (!dateStr) return 'none'

  if (dateStr === todayStr) {
    return 'today'
  }
  if (dateStr === tomorrowStr) {
    return 'tomorrow'
  }

  const date = parseDateString(dateStr)
  if (date < today) {
    return 'overdue'
  }

  return 'future'
}
