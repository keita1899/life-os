'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useAppMode } from '@/hooks/useAppMode'
import type React from 'react'
import { cn } from '@/lib/utils'
import {
  getWeekDays,
  formatDay,
  isToday,
  getWeekdays,
} from '../lib/utils'
import { getEventsForDate, sortEventsByTime } from '@/features/events'
import { getHolidayName } from '../lib/holidays'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { EventPopoverWrapper } from './EventPopover'
import { TaskPopoverWrapper } from './TaskPopover'
import { SubscriptionPopoverWrapper } from './SubscriptionPopover'
import { WeeklyGoalForm } from '@/features/goals'
import type { WeeklyGoal } from '@/features/goals'
import type { Event } from '@/features/events'
import type { Task } from '@/features/tasks'
import type { Subscription } from '@/features/subscriptions'
import { getTasksForDate } from '@/features/tasks'
import { getSubscriptionsForDate } from '@/features/subscriptions'

function WeekDateCell({
  date,
  isTodayDate,
  dayEvents,
  dayTasks,
  daySubscriptions,
  isExpanded,
  holidays,
  onToggleExpand,
  onEditEvent,
  onDeleteEvent,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
}: {
  date: Date
  isTodayDate: boolean
  dayEvents: Event[]
  dayTasks: Task[]
  daySubscriptions: Subscription[]
  isExpanded: boolean
  holidays: Map<string, string>
  onToggleExpand: () => void
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onToggleTaskCompletion?: (task: Task) => void
}) {
  const router = useRouter()
  const { isDevMode } = useAppMode()
  const [hasOpenPopover, setHasOpenPopover] = useState(false)
  const [hasOpenTaskPopover, setHasOpenTaskPopover] = useState(false)
  const [hasOpenSubscriptionPopover, setHasOpenSubscriptionPopover] = useState(false)
  const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 3)
  const hasMoreEvents = dayEvents.length > 3
  const holidayName = getHolidayName(date, holidays)
  const dayOfWeek = date.getDay()

  const navigateToDay = () => {
    if (!hasOpenPopover && !hasOpenTaskPopover && !hasOpenSubscriptionPopover) {
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
        'block min-h-[400px] p-2',
        'transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'bg-stone-50 dark:bg-stone-950',
        'hover:bg-stone-100 dark:hover:bg-stone-800',
        isTodayDate && 'ring-2 ring-blue-500 dark:ring-blue-400',
      )}
    >
      <div
        className={cn(
          'mb-2 flex h-7 items-center gap-1 text-sm',
          !isTodayDate && 'font-medium',
        )}
      >
        {isTodayDate ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 font-semibold text-white/80 dark:bg-blue-400 dark:text-white/75">
            {formatDay(date)}
          </span>
        ) : (
          <span
            className={cn(
              dayOfWeek === 0 && 'text-red-600 dark:text-red-400',
              dayOfWeek === 6 && 'text-blue-600 dark:text-blue-400',
            )}
          >
            {formatDay(date)}
          </span>
        )}
        {holidayName && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {holidayName}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {visibleEvents.map((event) => (
          <EventPopoverWrapper
            key={event.id}
            event={event}
            variant="week"
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
            onOpenChange={(open) => setHasOpenPopover(open)}
          />
        ))}
        {dayTasks.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {dayTasks.map((task) => (
              <TaskPopoverWrapper
                key={task.id}
                task={task}
                variant="week"
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleCompletion={onToggleTaskCompletion}
                onOpenChange={(open) => setHasOpenTaskPopover(open)}
              />
            ))}
          </div>
        )}
        {daySubscriptions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {daySubscriptions.map((subscription) => (
              <SubscriptionPopoverWrapper
                key={subscription.id}
                subscription={subscription}
                variant="week"
                onOpenChange={(open) => setHasOpenSubscriptionPopover(open)}
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
  weeklyGoals: WeeklyGoal[]
  events?: Event[]
  tasks?: Task[]
  subscriptions?: Subscription[]
  weekStartDay?: number
  showWeeklyGoalForm?: boolean
  holidays?: Map<string, string>
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onToggleTaskCompletion?: (task: Task) => void
}

export function WeekView({
  currentDate,
  weeklyGoals,
  events = [],
  tasks = [],
  subscriptions = [],
  weekStartDay = 0,
  showWeeklyGoalForm = true,
  holidays = new Map(),
  onEditEvent,
  onDeleteEvent,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
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
            className={cn(
              'bg-stone-50 px-2 py-2 text-center text-sm font-medium dark:bg-stone-950',
              day === '日'
                ? 'text-red-600 dark:text-red-400'
                : day === '土'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-stone-700 dark:text-stone-300',
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px border-x border-b border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekDays.map((date) => {
          const isTodayDate = isToday(date)
          const dayEvents = sortEventsByTime(getEventsForDate(events, date))
          const dayTasks = getTasksForDate(tasks, date)
          const daySubscriptions = getSubscriptionsForDate(subscriptions, date)
          const dateStr = date.toISOString()
          const isExpanded = expandedDates.has(dateStr)

          return (
            <WeekDateCell
              key={date.toISOString()}
              date={date}
              isTodayDate={isTodayDate}
              dayEvents={dayEvents}
              dayTasks={dayTasks}
              daySubscriptions={daySubscriptions}
              isExpanded={isExpanded}
              holidays={holidays}
              onToggleExpand={() => toggleDate(dateStr)}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onToggleTaskCompletion={onToggleTaskCompletion}
            />
          )
        })}
      </div>
    </div>
  )
}
