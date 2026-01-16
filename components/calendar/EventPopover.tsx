'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event, EventCategory } from '@/lib/types/event'

const CATEGORY_LABELS: Record<NonNullable<EventCategory>, string> = {
  work: '仕事',
  life: '生活',
  housework: '家事',
  social: '交際',
  play: '遊び',
  hobby: '趣味',
  health: '健康',
  procedure: '手続き',
  birthday: '誕生日',
  anniversary: '記念日',
}

const CATEGORY_COLORS: Record<NonNullable<EventCategory>, string> = {
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  life: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  housework:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  play: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  hobby:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  procedure: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  birthday: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  anniversary:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

interface EventPopoverContentProps {
  event: Event
}

export function EventPopoverContent({ event }: EventPopoverContentProps) {
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
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {event.title}
        </h3>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{formattedDateTime}</span>
        </div>
        {event.allDay && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              終日
            </span>
          </div>
        )}
        {event.category && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-md px-2 py-0.5',
                CATEGORY_COLORS[event.category],
              )}
            >
              {CATEGORY_LABELS[event.category]}
            </span>
          </div>
        )}
        {event.description && (
          <div className="pt-1">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
