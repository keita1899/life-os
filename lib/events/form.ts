import { formatDateTimeForInput, getTodayDateString } from '@/lib/date/formats'
import type { Event } from '@/lib/types/event'

export function getEventFormValues(data?: Event) {
  if (!data) {
    return {
      title: '',
      startDate: getTodayDateString(),
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: false,
      category: null,
      description: '',
      recurrenceRule: null,
      recurrenceDaysOfWeek: [] as number[],
      recurrenceDayOfMonth: null as number | null,
      recurrenceEndDate: '',
    }
  }

  const start = formatDateTimeForInput(data.startDatetime, data.allDay)
  const end = data.endDatetime
    ? formatDateTimeForInput(data.endDatetime, data.allDay)
    : { date: '', time: '' }

  return {
    title: data.title,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    allDay: data.allDay,
    category: data.category ?? null,
    description: data.description ?? '',
    recurrenceRule: data.recurrenceRule ?? null,
    recurrenceDaysOfWeek: data.recurrenceDaysOfWeek ?? [],
    recurrenceDayOfMonth: data.recurrenceDayOfMonth ?? null,
    recurrenceEndDate: data.recurrenceEndDate ?? '',
  }
}
