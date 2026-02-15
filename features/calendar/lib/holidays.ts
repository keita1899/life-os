import * as holiday_jp from '@holiday-jp/holiday_jp'
import { format } from 'date-fns'

export function getHolidaysForDateRange(
  startDate: Date,
  endDate: Date,
): Map<string, string> {
  const holidays = holiday_jp.between(startDate, endDate)
  const holidayMap = new Map<string, string>()
  
  holidays.forEach((holiday) => {
    const dateStr = format(new Date(holiday.date), 'yyyy-MM-dd')
    holidayMap.set(dateStr, holiday.name)
  })
  
  return holidayMap
}

export function getHolidayName(date: Date, holidayMap: Map<string, string>): string | null {
  const dateStr = format(date, 'yyyy-MM-dd')
  return holidayMap.get(dateStr) || null
}
