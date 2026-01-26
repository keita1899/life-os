'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import type React from 'react'
import { cn } from '@/lib/utils'
import {
  getCalendarDays,
  formatDay,
  isCurrentMonth,
  isToday,
  getGoalsForDate,
  getEventsForDate,
  formatEventTime,
  sortEventsByTime,
  getWeekdays,
} from '@/lib/calendar/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EventPopoverContent } from './EventPopover'
import { TaskPopoverContent } from './TaskPopover'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { Event } from '@/lib/types/event'
import type { Task } from '@/lib/types/task'
import { getTasksForDate } from '@/lib/logs/utils'

function EventPopoverWrapper({
  event,
  time,
  title,
  onEdit,
  onDelete,
  onOpenChange,
}: {
  event: Event
  time?: string
  title: string
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full truncate rounded px-1 text-left text-xs hover:opacity-80',
            'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300',
          )}
          title={title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {!event.allDay && time && (
            <span className="mr-1 text-[10px] opacity-70">{time}</span>
          )}
          {title}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <EventPopoverContent
          event={event}
          onEdit={
            onEdit
              ? (e) => {
                  handleOpenChange(false)
                  onEdit(e)
                }
              : undefined
          }
          onDelete={
            onDelete
              ? (e) => {
                  handleOpenChange(false)
                  onDelete(e)
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  )
}

function TaskPopoverWrapper({
  task,
  onOpenChange,
}: {
  task: Task
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full truncate rounded px-1 text-left text-xs hover:opacity-80',
            task.completed
              ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              : 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300',
          )}
          title={task.title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {task.title}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <TaskPopoverContent task={task} />
      </PopoverContent>
    </Popover>
  )
}

function DateCell({
  date,
  isCurrentMonthDay,
  isTodayDate,
  allItems,
  dayEvents,
  dayTasks,
  onEditEvent,
  onDeleteEvent,
}: {
  date: Date
  isCurrentMonthDay: boolean
  isTodayDate: boolean
  allItems: Array<
    | { type: 'goal'; id: number; title: string; data: MonthlyGoal }
    | { type: 'event'; id: number; title: string; time?: string; data: Event }
  >
  dayEvents: Event[]
  dayTasks: Task[]
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
}) {
  const router = useRouter()
  const [hasOpenPopover, setHasOpenPopover] = useState(false)

  const navigateToDay = () => {
    if (!hasOpenPopover) {
      router.push(`/logs?date=${format(date, 'yyyy-MM-dd')}`)
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
        'block min-h-[80px] bg-white p-1 dark:bg-stone-900',
        'hover:bg-stone-50 dark:hover:bg-stone-800',
        'transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !isCurrentMonthDay &&
          'bg-stone-50 text-stone-400 dark:bg-stone-950 dark:text-stone-600',
        isTodayDate && 'ring-2 ring-blue-500 dark:ring-blue-400',
      )}
    >
      <div
        className={cn(
          'mb-1 flex h-6 items-center text-sm',
          !isTodayDate && 'font-medium',
        )}
      >
        {isTodayDate ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 font-semibold text-white dark:bg-blue-400">
            {formatDay(date)}
          </span>
        ) : (
          formatDay(date)
        )}
      </div>
      <div className="space-y-0.5">
        {allItems.map((item) => {
          if (item.type === 'event') {
            return (
              <EventPopoverWrapper
                key={`${item.type}-${item.id}`}
                event={item.data}
                time={item.time}
                title={item.title}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onOpenChange={(open) => setHasOpenPopover(open)}
              />
            )
          }
          return (
            <div
              key={`${item.type}-${item.id}`}
              className={cn(
                'truncate rounded px-1 text-xs',
                'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300',
              )}
              title={item.title}
            >
              {item.title}
            </div>
          )
        })}
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
      </div>
    </div>
  )
}

interface MonthViewProps {
  currentDate: Date
  monthlyGoals: MonthlyGoal[]
  events?: Event[]
  tasks?: Task[]
  weekStartDay?: number
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
}

export function MonthView({
  currentDate,
  monthlyGoals,
  events = [],
  tasks = [],
  weekStartDay = 0,
  onEditEvent,
  onDeleteEvent,
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
            const dayGoals = getGoalsForDate(monthlyGoals, date)
            const dayEvents = sortEventsByTime(getEventsForDate(events, date))
            const dayTasks = getTasksForDate(tasks, date)
            const allItems = [
              ...dayGoals.map((goal) => ({
                type: 'goal' as const,
                id: goal.id,
                title: goal.title,
                data: goal,
              })),
              ...dayEvents.slice(0, 1).map((event) => ({
                type: 'event' as const,
                id: event.id,
                title: event.title,
                time: formatEventTime(event),
                data: event,
              })),
            ]

            return (
              <DateCell
                key={`${weekIndex}-${dayIndex}`}
                date={date}
                isCurrentMonthDay={isCurrentMonthDay}
                isTodayDate={isTodayDate}
                allItems={allItems}
                dayEvents={dayEvents}
                dayTasks={dayTasks}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
              />
            )
          }),
        )}
      </div>
    </div>
  )
}
