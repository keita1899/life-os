import { format, parseISO, isWithinInterval } from 'date-fns'
import type { Event } from '../types/event'

export function getEventsForDate(events: Event[], date: Date): Event[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dateStart = new Date(dateStr + 'T00:00:00')
  const dateEnd = new Date(dateStr + 'T23:59:59')

  return events.filter((event) => {
    try {
      const eventStart = parseISO(event.startDatetime)
      if (isNaN(eventStart.getTime())) {
        console.warn('Invalid startDatetime:', event.startDatetime, event)
        return false
      }
      const eventStartDate = format(eventStart, 'yyyy-MM-dd')

      if (event.allDay) {
        if (event.endDatetime) {
          const eventEnd = parseISO(event.endDatetime)
          if (isNaN(eventEnd.getTime())) {
            return eventStartDate === dateStr
          }
          const eventEndDate = format(eventEnd, 'yyyy-MM-dd')
          return (
            (dateStr >= eventStartDate && dateStr <= eventEndDate) ||
            (dateStr >= eventEndDate && dateStr <= eventStartDate)
          )
        }
        return eventStartDate === dateStr
      }

      if (event.endDatetime) {
        const eventEnd = parseISO(event.endDatetime)
        if (isNaN(eventEnd.getTime())) {
          return eventStartDate === dateStr
        }
        return (
          isWithinInterval(dateStart, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(dateEnd, { start: eventStart, end: eventEnd }) ||
          (eventStart <= dateStart && eventEnd >= dateEnd) ||
          eventStartDate === dateStr
        )
      }

      return eventStartDate === dateStr
    } catch (error) {
      console.error('Error parsing event date:', error, event)
      return false
    }
  })
}

export function formatEventTime(event: Event): string {
  if (event.allDay) {
    return '終日'
  }

  const startDate = parseISO(event.startDatetime)
  const startTime = format(startDate, 'HH:mm')

  if (event.endDatetime) {
    const endDate = parseISO(event.endDatetime)
    const endTime = format(endDate, 'HH:mm')
    if (startTime === '00:00' && endTime === '00:00') {
      return ''
    }
    return `${startTime} - ${endTime}`
  }

  if (startTime === '00:00') {
    return ''
  }
  return startTime
}

export function sortEventsByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.allDay && !b.allDay) {
      return -1
    }
    if (!a.allDay && b.allDay) {
      return 1
    }
    if (a.allDay && b.allDay) {
      return a.title.localeCompare(b.title)
    }

    const aStart = parseISO(a.startDatetime)
    const bStart = parseISO(b.startDatetime)
    return aStart.getTime() - bStart.getTime()
  })
}
