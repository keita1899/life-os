'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Clock } from 'lucide-react'
import { getDateLabel } from '@/lib/date/labels'
import { formatMonthDayDisplay } from '@/lib/date/formats'
import { cn } from '@/lib/utils'
import type { Event } from '../types/event'

const DATE_LABEL_STYLES: Record<string, string> = {
  today: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  tomorrow:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  future: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
}

const DEFAULT_DATE_STYLE =
  'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'

interface EventDateTimeProps {
  event: Event
}

export function EventDateTime({ event }: EventDateTimeProps) {
  const { dateLabel, dateLabelStyle, timePart } = useMemo(() => {
    const startDate = parseISO(event.startDatetime)
    const startDateStr = format(startDate, 'yyyy-MM-dd')
    const label = getDateLabel(startDateStr)
    const style = label
      ? DATE_LABEL_STYLES[label.type] ?? DEFAULT_DATE_STYLE
      : DEFAULT_DATE_STYLE

    if (event.allDay) {
      if (event.endDatetime) {
        const endDate = parseISO(event.endDatetime)
        if (startDateStr === format(endDate, 'yyyy-MM-dd')) {
          return {
            dateLabel: label?.text ?? formatMonthDayDisplay(startDateStr),
            dateLabelStyle: style,
            timePart: null,
          }
        }
        const endLabel = getDateLabel(format(endDate, 'yyyy-MM-dd'))
        const endText = endLabel?.text ?? formatMonthDayDisplay(format(endDate, 'yyyy-MM-dd'))
        return {
          dateLabel: `${label?.text ?? formatMonthDayDisplay(startDateStr)} - ${endText}`,
          dateLabelStyle: style,
          timePart: null,
        }
      }
      return {
        dateLabel: label?.text ?? formatMonthDayDisplay(startDateStr),
        dateLabelStyle: style,
        timePart: null,
      }
    }

    const startTime = format(startDate, 'HH:mm', { locale: ja })
    if (event.endDatetime) {
      const endDate = parseISO(event.endDatetime)
      const endTimeStr = format(endDate, 'HH:mm', { locale: ja })
      const isSameDay = startDateStr === format(endDate, 'yyyy-MM-dd')
      const part = isSameDay
        ? `${startTime} - ${endTimeStr}`
        : `${startTime} - ${format(endDate, 'M/d(E) HH:mm', { locale: ja })}`
      return { dateLabel: label?.text ?? formatMonthDayDisplay(startDateStr), dateLabelStyle: style, timePart: part }
    }
    return {
      dateLabel: label?.text ?? formatMonthDayDisplay(startDateStr),
      dateLabelStyle: style,
      timePart: startTime !== '00:00' ? startTime : null,
    }
  }, [event.startDatetime, event.endDatetime, event.allDay])

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-3 w-3 shrink-0" />
      <span
        className={cn(
          'rounded-md px-2 py-0.5 text-xs font-medium',
          dateLabelStyle,
        )}
      >
        {dateLabel}
      </span>
      {timePart != null && <span>{timePart}</span>}
    </div>
  )
}
