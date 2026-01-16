'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Clock } from 'lucide-react'
import type { Event } from '@/lib/types/event'

interface EventDateTimeProps {
  event: Event
}

export function EventDateTime({ event }: EventDateTimeProps) {
  const formattedDateTime = useMemo(() => {
    const startDate = parseISO(event.startDatetime)

    if (event.allDay) {
      const startDateStr = format(startDate, 'yyyy年M月d日(E)', {
        locale: ja,
      })
      if (event.endDatetime) {
        const endDate = parseISO(event.endDatetime)
        if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
          return startDateStr
        }
        const endDateStr = format(endDate, 'yyyy年M月d日(E)', { locale: ja })
        return `${startDateStr} - ${endDateStr}`
      }
      return startDateStr
    }

    const startTime = format(startDate, 'HH:mm')
    const hasStartTime = startTime !== '00:00'
    const startDateStr = hasStartTime
      ? format(startDate, 'yyyy年M月d日(E) HH:mm', { locale: ja })
      : format(startDate, 'yyyy年M月d日(E)', { locale: ja })

    if (event.endDatetime) {
      const endDate = parseISO(event.endDatetime)
      const endTime = format(endDate, 'HH:mm')
      const hasEndTime = endTime !== '00:00'
      if (hasEndTime) {
        const endDateStr = format(endDate, 'HH:mm', { locale: ja })
        return `${startDateStr} - ${endDateStr}`
      }
      if (format(startDate, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd')) {
        const endDateStr = format(endDate, 'yyyy年M月d日(E)', { locale: ja })
        return `${startDateStr} - ${endDateStr}`
      }
    }
    return startDateStr
  }, [event.startDatetime, event.endDatetime, event.allDay])

  return (
    <div className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      <span>{formattedDateTime}</span>
    </div>
  )
}
