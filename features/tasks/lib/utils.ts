import {
  getTodayDate,
  getTodayDateString,
  getTomorrowDateString,
  formatDateISO,
} from '@/lib/date/formats'
import { categorizeDate } from '@/lib/date/labels'
import type { Task } from '../types/task'

export function getTodayTasks(tasks: Task[]): Task[] {
  const today = getTodayDate()
  const todayStr = getTodayDateString()
  const tomorrowStr = getTomorrowDateString()

  return tasks.filter((task) => {
    if (task.completed) return false
    const category = categorizeDate(
      task.executionDate,
      todayStr,
      tomorrowStr,
      today,
    )
    return category === 'today'
  })
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

export function getTasksForWeek(
  tasks: Task[],
  weekStartDateStr: string,
  weekEndDateStr: string,
): Task[] {
  return tasks.filter(
    (task) =>
      task.executionDate !== null &&
      task.executionDate >= weekStartDateStr &&
      task.executionDate <= weekEndDateStr,
  )
}

export function getTasksCompletedInWeek(
  tasks: Task[],
  weekStartDateStr: string,
  weekEndDateStr: string,
): Task[] {
  return tasks.filter(
    (task) =>
      task.completed &&
      task.executionDate !== null &&
      task.executionDate >= weekStartDateStr &&
      task.executionDate <= weekEndDateStr,
  )
}

export function getOverdueTasksInWeek(
  tasks: Task[],
  weekStartDateStr: string,
  beforeDateStr: string,
): Task[] {
  return tasks.filter(
    (task) =>
      !task.completed &&
      task.executionDate !== null &&
      task.executionDate >= weekStartDateStr &&
      task.executionDate < beforeDateStr,
  )
}
