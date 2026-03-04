import { formatDateISO, getTodayDateString } from '@/lib/date/formats'
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  format,
} from 'date-fns'

export type PeriodType = 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom'

export interface PeriodRange {
  startDate: string
  endDate: string
  label: string
}

export function getPeriodRange(periodType: PeriodType, year?: number, month?: number): PeriodRange {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (periodType) {
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
      if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        year <= 0 ||
        month < 1 ||
        month > 12
      ) {
        throw new RangeError(
          `Invalid custom year/month: year=${year}, month=${month}`,
        )
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
