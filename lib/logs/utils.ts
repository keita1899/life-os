import { getYear, getMonth, startOfWeek } from 'date-fns'
import { getEventsForDate, sortEventsByTime } from '../calendar/utils'
import { formatDateISO } from '../date/formats'
import type { YearlyGoal } from '../types/yearly-goal'
import type { MonthlyGoal } from '../types/monthly-goal'
import type { WeeklyGoal } from '../types/weekly-goal'
import type { Task } from '../types/task'
import type { Event } from '../types/event'

export function getYearlyGoalsForDate(
  goals: YearlyGoal[],
  date: Date,
): YearlyGoal[] {
  const year = getYear(date)
  return goals.filter((goal) => goal.year === year)
}

export function getMonthlyGoalsForDate(
  goals: MonthlyGoal[],
  date: Date,
): MonthlyGoal[] {
  const year = getYear(date)
  const month = getMonth(date) + 1
  return goals.filter((goal) => goal.year === year && goal.month === month)
}

export function getWeeklyGoalsForDate(
  goals: WeeklyGoal[],
  date: Date,
  weekStartDay: number = 1,
): WeeklyGoal[] {
  const weekStartsOn = 1
  const weekStart = startOfWeek(date, { weekStartsOn })
  weekStart.setHours(0, 0, 0, 0)
  const weekStartDate = formatDateISO(weekStart)
  
  return goals.filter((goal) => goal.weekStartDate === weekStartDate)
}

export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const dateStr = formatDateISO(date)
  const filteredTasks = tasks.filter(
    (task) => task.executionDate !== null && task.executionDate === dateStr,
  )
  
  const incompleteTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)
  
  return [...incompleteTasks, ...completedTasks]
}

export function getEventsForDateSorted(
  events: Event[],
  date: Date,
): Event[] {
  return sortEventsByTime(getEventsForDate(events, date))
}
