'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import type React from 'react'
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
import { TaskPopoverContent } from './TaskPopover'
import { WeeklyGoalForm } from '@/components/goals/WeeklyGoalForm'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'
import type { Event } from '@/lib/types/event'
import type { Task } from '@/lib/types/task'
import { getTasksForDate } from '@/lib/logs/utils'

function EventPopoverWrapper({
  event,
  onOpenChange,
}: {
  event: Event
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
          className="w-full rounded bg-green-100 px-2 py-1.5 text-left text-xs text-green-900 hover:opacity-80 dark:bg-green-900/30 dark:text-green-300"
          title={event.title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="flex items-center gap-1.5">
            {!event.allDay && formatEventTime(event) && (
              <span className="text-[10px] opacity-70">
                {formatEventTime(event)}
              </span>
            )}
            <span className="font-medium line-clamp-2">{event.title}</span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <EventPopoverContent event={event} />
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
            'w-full rounded px-2 py-1.5 text-left text-xs hover:opacity-80',
            task.completed
              ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              : 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300',
          )}
          title={task.title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="font-medium line-clamp-2">{task.title}</div>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <TaskPopoverContent task={task} />
      </PopoverContent>
    </Popover>
  )
}

function WeekDateCell({
  date,
  isTodayDate,
  dayGoals,
  dayEvents,
  dayTasks,
  isExpanded,
  onToggleExpand,
}: {
  date: Date
  isTodayDate: boolean
  dayGoals: MonthlyGoal[]
  dayEvents: Event[]
  dayTasks: Task[]
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const router = useRouter()
  const [hasOpenPopover, setHasOpenPopover] = useState(false)
  const [hasOpenTaskPopover, setHasOpenTaskPopover] = useState(false)
  const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 3)
  const hasMoreEvents = dayEvents.length > 3

  const navigateToDay = () => {
    if (!hasOpenPopover && !hasOpenTaskPopover) {
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
        'block min-h-[400px] bg-white p-2 dark:bg-stone-950',
        'hover:bg-stone-50 dark:hover:bg-stone-900',
        'transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
          <EventPopoverWrapper
            key={event.id}
            event={event}
            onOpenChange={(open) => setHasOpenPopover(open)}
          />
        ))}
        {dayTasks.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {dayTasks.map((task) => (
              <TaskPopoverWrapper
                key={task.id}
                task={task}
                onOpenChange={(open) => setHasOpenTaskPopover(open)}
              />
            ))}
          </div>
        )}
        {hasMoreEvents && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
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
}

interface WeekViewProps {
  currentDate: Date
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  events?: Event[]
  tasks?: Task[]
  weekStartDay?: number
  showWeeklyGoalForm?: boolean
}

export function WeekView({
  currentDate,
  monthlyGoals,
  weeklyGoals,
  events = [],
  tasks = [],
  weekStartDay = 0,
  showWeeklyGoalForm = true,
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
      {showWeeklyGoalForm && (
        <WeeklyGoalForm
          currentDate={currentDate}
          weeklyGoals={weeklyGoals}
          weekStartDay={weekStartDay}
        />
      )}
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
          const dayTasks = getTasksForDate(tasks, date)
          const dateStr = date.toISOString()
          const isExpanded = expandedDates.has(dateStr)

          return (
            <WeekDateCell
              key={date.toISOString()}
              date={date}
              isTodayDate={isTodayDate}
              dayGoals={dayGoals}
              dayEvents={dayEvents}
              dayTasks={dayTasks}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleDate(dateStr)}
            />
          )
        })}
      </div>
    </div>
  )
}
