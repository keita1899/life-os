'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  getWeekDays,
  formatDay,
  isToday,
  getGoalsForDate,
  getEventsForDate,
  formatEventTime,
  sortEventsByTime,
  getWeekdays,
} from '@/lib/calendar/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EventPopoverContent } from './EventPopover'
import { WeeklyGoalForm } from '@/components/goals/WeeklyGoalForm'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'
import type { Event } from '@/lib/types/event'

interface WeekViewProps {
  currentDate: Date
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  events?: Event[]
  weekStartDay?: number
}

export function WeekView({
  currentDate,
  monthlyGoals,
  weeklyGoals,
  events = [],
  weekStartDay = 0,
}: WeekViewProps) {
  const weekDays = useMemo(
    () => getWeekDays(currentDate, weekStartDay),
    [currentDate, weekStartDay],
  )
  const weekdaysList = useMemo(() => getWeekdays(weekStartDay), [weekStartDay])
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  const toggleDate = (dateStr: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev)
      if (next.has(dateStr)) {
        next.delete(dateStr)
      } else {
        next.add(dateStr)
      }
      return next
    })
  }

  return (
    <div className="w-full">
      <WeeklyGoalForm
        currentDate={currentDate}
        weeklyGoals={weeklyGoals}
        weekStartDay={weekStartDay}
      />
      <div className="grid grid-cols-7 gap-px border border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekdaysList.map((day) => (
          <div
            key={day}
            className="bg-stone-50 px-2 py-2 text-center text-sm font-medium text-stone-700 dark:bg-stone-950 dark:text-stone-300"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px border-x border-b border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekDays.map((date) => {
          const isTodayDate = isToday(date)
          const dayGoals = getGoalsForDate(monthlyGoals, date)
          const dayEvents = sortEventsByTime(getEventsForDate(events, date))
          const dateStr = date.toISOString()
          const isExpanded = expandedDates.has(dateStr)
          const visibleEvents = isExpanded
            ? dayEvents
            : dayEvents.slice(0, 3)
          const hasMoreEvents = dayEvents.length > 3

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[400px] bg-white p-2 dark:bg-stone-950',
                isTodayDate && 'ring-2 ring-blue-500 dark:ring-blue-400',
              )}
            >
              <div
                className={cn(
                  'mb-2 flex h-7 items-center text-sm',
                  !isTodayDate && 'font-medium',
                )}
              >
                {isTodayDate ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 font-semibold text-white dark:bg-blue-400">
                    {formatDay(date)}
                  </span>
                ) : (
                  formatDay(date)
                )}
              </div>
              <div className="space-y-1.5">
                {dayGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded bg-blue-100 px-2 py-1.5 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                    title={goal.title}
                  >
                    <div className="font-medium line-clamp-2">{goal.title}</div>
                  </div>
                ))}
                {visibleEvents.map((event) => (
                  <Popover key={event.id}>
                    <PopoverTrigger asChild>
                      <button
                        className="w-full rounded bg-green-100 px-2 py-1.5 text-left text-xs text-green-900 hover:opacity-80 dark:bg-green-900/30 dark:text-green-300"
                        title={event.title}
                      >
                        <div className="flex items-center gap-1.5">
                          {!event.allDay && (
                            <span className="text-[10px] opacity-70">
                              {formatEventTime(event)}
                            </span>
                          )}
                          <span className="font-medium line-clamp-2">
                          {event.title}
                          </span>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <EventPopoverContent event={event} />
                    </PopoverContent>
                  </Popover>
                ))}
                {hasMoreEvents && (
                  <button
                    onClick={() => toggleDate(dateStr)}
                    className="flex w-full items-center justify-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        <span>折りたたむ</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>+{dayEvents.length - 3}件を表示</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
