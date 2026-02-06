'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useMode } from '@/lib/contexts/ModeContext'
import type React from 'react'
import { cn } from '@/lib/utils'
import {
  getWeekDays,
  formatDay,
  isToday,
  getEventsForDate,
  formatEventTime,
  sortEventsByTime,
  getWeekdays,
} from '@/lib/calendar/utils'
import { getHolidayName } from '@/lib/calendar/holidays'
import { CheckCircle2, ChevronDown, ChevronUp, Circle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EventPopoverContent } from './EventPopover'
import { TaskPopoverContent } from './TaskPopover'
import { SubscriptionPopoverContent } from './SubscriptionPopover'
import { WeeklyGoalForm } from '@/components/goals/WeeklyGoalForm'
import { CreditCard } from 'lucide-react'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'
import type { Event } from '@/lib/types/event'
import type { Task } from '@/lib/types/task'
import type { Subscription } from '@/lib/types/subscription'
import { getTasksForDate, getSubscriptionsForDate } from '@/lib/logs/utils'
import {
  isBarcelonaMatch,
  getBarcelonaMatchBackground,
  BARCELONA_MATCH_TEXT_COLOR,
  BARCELONA_MATCH_TITLE_COLOR,
} from '@/lib/football'

function EventPopoverWrapper({
  event,
  onEdit,
  onDelete,
  onOpenChange,
}: {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(
        document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches,
      )
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => checkDarkMode()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
    } else {
      mediaQuery.addListener(handleMediaChange)
    }
    return () => {
      observer.disconnect()
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const isBarca = isBarcelonaMatch(event)

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full rounded px-2 py-1.5 text-left text-xs hover:opacity-80',
            isBarca
              ? BARCELONA_MATCH_TEXT_COLOR
              : 'bg-blue-900/10 text-stone-900 dark:bg-blue-900/20 dark:text-stone-100',
          )}
          style={
            isBarca
              ? {
                  background: getBarcelonaMatchBackground(isDark),
                }
              : undefined
          }
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
            <span
              className="font-medium line-clamp-2"
              style={
                isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined
              }
            >
              {event.title}
            </span>
          </div>
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
  onEdit,
  onDelete,
  onToggleCompletion,
  onOpenChange,
}: {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleCompletion?: (task: Task) => void
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
            'flex w-full items-center gap-1 rounded border px-2 py-1.5 text-left text-xs hover:opacity-80',
            task.completed
              ? 'border-stone-200/60 bg-stone-900/5 text-stone-600 dark:border-stone-700/40 dark:bg-stone-900/20 dark:text-stone-400'
              : 'border-stone-200/60 bg-stone-900/10 text-stone-900 dark:border-stone-700/40 dark:bg-stone-900/20 dark:text-stone-100',
          )}
          title={task.title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {onToggleCompletion && (
            <span
              role="button"
              tabIndex={0}
              className="inline-flex h-4 w-4 items-center justify-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleCompletion(task)
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                e.stopPropagation()
                onToggleCompletion(task)
              }}
              aria-label={task.completed ? '未完了にする' : '完了にする'}
            >
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-stone-400" />
              )}
            </span>
          )}
          <span
            className={cn(
              'min-w-0 flex-1 font-medium line-clamp-2',
              task.completed && 'line-through',
            )}
          >
            {task.title}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <TaskPopoverContent
          task={task}
          onEdit={
            onEdit
              ? (t) => {
                  handleOpenChange(false)
                  onEdit(t)
                }
              : undefined
          }
          onDelete={
            onDelete
              ? (t) => {
                  handleOpenChange(false)
                  onDelete(t)
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  )
}

function SubscriptionPopoverWrapper({
  subscription,
  onEdit,
  onDelete,
  onOpenChange,
}: {
  subscription: Subscription
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
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
            'flex w-full items-center gap-1 rounded border px-2 py-1.5 text-left text-xs hover:opacity-80',
            'border-purple-200/60 bg-purple-50/50 text-purple-900 dark:border-purple-800/40 dark:bg-purple-950/20 dark:text-purple-100',
          )}
          title={subscription.name}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <CreditCard className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
          <span className="min-w-0 flex-1 font-medium line-clamp-2">更新日 {subscription.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <SubscriptionPopoverContent
          subscription={subscription}
          onEdit={
            onEdit
              ? (s) => {
                  handleOpenChange(false)
                  onEdit(s)
                }
              : undefined
          }
          onDelete={
            onDelete
              ? (s) => {
                  handleOpenChange(false)
                  onDelete(s)
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  )
}

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
  onEditSubscription,
  onDeleteSubscription,
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
  onEditSubscription?: (subscription: Subscription) => void
  onDeleteSubscription?: (subscription: Subscription) => void
}) {
  const router = useRouter()
  const { mode } = useMode()
  const [hasOpenPopover, setHasOpenPopover] = useState(false)
  const [hasOpenTaskPopover, setHasOpenTaskPopover] = useState(false)
  const [hasOpenSubscriptionPopover, setHasOpenSubscriptionPopover] = useState(false)
  const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 3)
  const hasMoreEvents = dayEvents.length > 3
  const holidayName = getHolidayName(date, holidays)

  const navigateToDay = () => {
    if (!hasOpenPopover && !hasOpenTaskPopover && !hasOpenSubscriptionPopover) {
      const dateStr = format(date, 'yyyy-MM-dd')
      if (mode === 'development') {
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
        'block min-h-[400px] bg-stone-50 p-2 dark:bg-stone-950',
        'hover:bg-stone-100 dark:hover:bg-stone-800',
        'transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
          formatDay(date)
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
                onEdit={onEditSubscription}
                onDelete={onDeleteSubscription}
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
  onEditSubscription?: (subscription: Subscription) => void
  onDeleteSubscription?: (subscription: Subscription) => void
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
  onEditSubscription,
  onDeleteSubscription,
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
              onEditSubscription={onEditSubscription}
              onDeleteSubscription={onDeleteSubscription}
            />
          )
        })}
      </div>
    </div>
  )
}
