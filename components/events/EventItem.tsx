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

interface EventItemProps {
  event: Event
}

export function EventItem({ event }: EventItemProps) {
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

  const recurrenceLabel = useMemo(() => {
    const labels: Record<Event['recurrenceType'], string> = {
      none: '',
      daily: '毎日',
      weekly: '毎週',
      monthly: '毎月',
      yearly: '毎年',
    }
    let label = labels[event.recurrenceType]

    if (event.recurrenceType === 'weekly' && event.recurrenceDaysOfWeek) {
      const dayLabels = ['日', '月', '火', '水', '木', '金', '土']
      const selectedDays = event.recurrenceDaysOfWeek
        .map((day) => dayLabels[day])
        .join('・')
      if (selectedDays) {
        label = `毎週 ${selectedDays}`
      }
    }

    return label
  }, [event.recurrenceType, event.recurrenceDaysOfWeek])

  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="mt-0.5">
        <Calendar className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
          {event.title}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formattedDateTime}</span>
          </div>
          {event.category && (
            <span
              className={cn(
                'rounded-md px-2 py-0.5',
                CATEGORY_COLORS[event.category],
              )}
            >
              {CATEGORY_LABELS[event.category]}
            </span>
          )}
          {event.allDay && (
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              終日
            </span>
          )}
          {recurrenceLabel && (
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {recurrenceLabel}
            </span>
          )}
        </div>
        {event.description && (
          <div className="mt-2 text-xs text-muted-foreground">
            {event.description}
          </div>
        )}
      </div>
    </div>
  )
}
