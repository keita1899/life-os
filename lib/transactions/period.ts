import { formatDateISO, getTodayDateString } from '../date/formats'
import {
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  format,
} from 'date-fns'

export type PeriodType = 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom'

export interface PeriodRange {
  startDate: string
  endDate: string
  label: string
}

export function getPeriodRange(periodType: PeriodType, year?: number, month?: number): PeriodRange {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (periodType) {
    case 'today': {
      const todayStr = getTodayDateString()
      return {
        startDate: todayStr,
        endDate: todayStr,
        label: '今日',
      }
    }

    case 'thisWeek': {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      weekStart.setHours(0, 0, 0, 0)
      return {
        startDate: formatDateISO(weekStart),
        endDate: getTodayDateString(),
        label: '今週',
      }
    }

    case 'thisMonth': {
      const monthStart = startOfMonth(today)
      return {
        startDate: formatDateISO(monthStart),
        endDate: getTodayDateString(),
        label: '今月',
      }
    }

    case 'lastMonth': {
      const lastMonth = subMonths(today, 1)
      const lastMonthStart = startOfMonth(lastMonth)
      const lastMonthEnd = endOfMonth(lastMonth)
      return {
        startDate: formatDateISO(lastMonthStart),
        endDate: formatDateISO(lastMonthEnd),
        label: '先月',
      }
    }

    case 'thisYear': {
      const yearStart = startOfYear(today)
      return {
        startDate: formatDateISO(yearStart),
        endDate: getTodayDateString(),
        label: '今年',
      }
    }

    case 'custom': {
      if (year === undefined || month === undefined) {
        const monthStart = startOfMonth(today)
        const monthEnd = endOfMonth(today)
        return {
          startDate: formatDateISO(monthStart),
          endDate: formatDateISO(monthEnd),
          label: format(today, 'yyyy年M月'),
        }
      }
      const customDate = new Date(year, month - 1, 1)
      const customMonthStart = startOfMonth(customDate)
      const customMonthEnd = endOfMonth(customDate)
      return {
        startDate: formatDateISO(customMonthStart),
        endDate: formatDateISO(customMonthEnd),
        label: format(customDate, 'yyyy年M月'),
      }
    }
  }
}
