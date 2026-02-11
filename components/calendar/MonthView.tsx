'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useAppMode } from '@/hooks/useAppMode'
import type React from 'react'
import { cn } from '@/lib/utils'
import {
  getCalendarDays,
  formatDay,
  isCurrentMonth,
  isToday,
  getEventsForDate,
  formatEventTime,
  sortEventsByTime,
  getWeekdays,
} from '@/lib/calendar/utils'
import { getHolidayName } from '@/lib/calendar/holidays'
import { EventPopoverWrapper } from './EventPopover'
import { TaskPopoverWrapper } from './TaskPopover'
import { SubscriptionPopoverWrapper } from './SubscriptionPopover'
import type { Event } from '@/features/events'
import type { Task } from '@/features/tasks'
import type { Subscription } from '@/features/subscriptions'
import { getTasksForDate, getSubscriptionsForDate } from '@/lib/logs/utils'

function DateCell({
  date,
  isCurrentMonthDay,
  isTodayDate,
  allItems,
  dayEvents,
  dayTasks,
  daySubscriptions,
  holidays,
  onEditEvent,
  onDeleteEvent,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
}: {
  date: Date
  isCurrentMonthDay: boolean
  isTodayDate: boolean
  allItems: Array<{
    type: 'event'
    id: number
    title: string
    time?: string
    data: Event
  }>
  dayEvents: Event[]
  dayTasks: Task[]
  daySubscriptions: Subscription[]
  holidays: Map<string, string>
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onToggleTaskCompletion?: (task: Task) => void
}) {
  const router = useRouter()
  const { isDevMode } = useAppMode()
  const [hasOpenPopover, setHasOpenPopover] = useState(false)
  const holidayName = getHolidayName(date, holidays)

  const navigateToDay = () => {
    if (!hasOpenPopover) {
      const dateStr = format(date, 'yyyy-MM-dd')
      if (isDevMode) {
        router.push(`/dev/logs?date=${dateStr}`)
      } else {
        router.push(`/logs?date=${dateStr}`)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigateToDay()
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={navigateToDay}
      onKeyDown={handleKeyDown}
      className={cn(
        'block min-h-[80px] bg-stone-50 p-1 dark:bg-stone-950',
        'hover:bg-stone-100 dark:hover:bg-stone-800',
        'transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !isCurrentMonthDay && 'text-stone-400 dark:text-stone-600',
        isTodayDate && 'ring-2 ring-blue-500 dark:ring-blue-400',
      )}
    >
      <div
        className={cn(
          'mb-1 flex h-6 items-center gap-1 text-sm',
          !isTodayDate && 'font-medium',
        )}
      >
        {isTodayDate ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 font-semibold text-white/80 dark:bg-blue-400 dark:text-white/75">
            {formatDay(date)}
          </span>
        ) : (
          formatDay(date)
        )}
        {holidayName && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {holidayName}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {allItems.map((item) => (
          <EventPopoverWrapper
            key={`${item.type}-${item.id}`}
            event={item.data}
            variant="month"
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
            onOpenChange={(open) => setHasOpenPopover(open)}
          />
        ))}
        {dayEvents.length > 1 && (
          <div className="text-xs text-muted-foreground">
            +{dayEvents.length - 1}
          </div>
        )}
        {dayTasks.length > 0 && (
          <>
            <div className="mt-1.5 space-y-0.5">
              {dayTasks.slice(0, 2).map((task) => (
                <TaskPopoverWrapper
                  key={task.id}
                  task={task}
                  variant="month"
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleCompletion={onToggleTaskCompletion}
                  onOpenChange={(open) => setHasOpenPopover(open)}
                />
              ))}
              {dayTasks.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayTasks.length - 2}
                </div>
              )}
            </div>
          </>
        )}
        {daySubscriptions.length > 0 && (
          <>
            <div className="mt-1.5 space-y-0.5">
              {daySubscriptions.map((subscription) => (
                <SubscriptionPopoverWrapper
                  key={subscription.id}
                  subscription={subscription}
                  variant="month"
                  onOpenChange={(open) => setHasOpenPopover(open)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface MonthViewProps {
  currentDate: Date
  events?: Event[]
  tasks?: Task[]
  subscriptions?: Subscription[]
  weekStartDay?: number
  holidays?: Map<string, string>
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onToggleTaskCompletion?: (task: Task) => void
}

export function MonthView({
  currentDate,
  events = [],
  tasks = [],
  subscriptions = [],
  weekStartDay = 0,
  holidays = new Map(),
  onEditEvent,
  onDeleteEvent,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
}: MonthViewProps) {
  const calendarDays = useMemo(
    () => getCalendarDays(currentDate, weekStartDay),
    [currentDate, weekStartDay],
  )

  const weeks = useMemo(() => {
    const weeks: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }
    return weeks
  }, [calendarDays])

  const weekdaysList = useMemo(() => getWeekdays(weekStartDay), [weekStartDay])

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-px border border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekdaysList.map((day) => (
          <div
            key={day}
            className="bg-stone-50 px-2 py-2 text-center text-sm font-medium text-stone-700 dark:bg-stone-950 dark:text-stone-300"
          >
            {day}
          </div>
        ))}
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonthDay = isCurrentMonth(date, currentDate)
            const isTodayDate = isToday(date)
            const dayEvents = sortEventsByTime(getEventsForDate(events, date))
            const dayTasks = getTasksForDate(tasks, date)
            const daySubscriptions = getSubscriptionsForDate(subscriptions, date)
            const allItems = dayEvents.slice(0, 1).map((event) => ({
              type: 'event' as const,
              id: event.id,
              title: event.title,
              time: formatEventTime(event),
              data: event,
            }))

            return (
              <DateCell
                key={`${weekIndex}-${dayIndex}`}
                date={date}
                isCurrentMonthDay={isCurrentMonthDay}
                isTodayDate={isTodayDate}
                allItems={allItems}
                dayEvents={dayEvents}
                dayTasks={dayTasks}
                daySubscriptions={daySubscriptions}
                holidays={holidays}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onToggleTaskCompletion={onToggleTaskCompletion}
              />
            )
          }),
        )}
      </div>
    </div>
  )
}
