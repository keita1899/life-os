import {
  getTodayDate,
  getTodayDateString,
  getTomorrowDateString,
} from '@/lib/date/formats'
import { categorizeDate } from '@/lib/date/labels'
import type { DevTask } from '../types/dev-task'

export function getTodayDevTasks(tasks: DevTask[]): DevTask[] {
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

export function getDevTasksForWeek(
  tasks: DevTask[],
  weekStartDateStr: string,
  weekEndDateStr: string,
): DevTask[] {
  return tasks.filter(
    (task) =>
      task.executionDate !== null &&
      task.executionDate >= weekStartDateStr &&
      task.executionDate <= weekEndDateStr,
  )
}

export function getDevTasksCompletedInWeek(
  tasks: DevTask[],
  weekStartDateStr: string,
  weekEndDateStr: string,
): DevTask[] {
  return tasks.filter(
    (task) =>
      task.completed &&
      task.executionDate !== null &&
      task.executionDate >= weekStartDateStr &&
      task.executionDate <= weekEndDateStr,
  )
}

export function getOverdueDevTasksInWeek(
  tasks: DevTask[],
  weekStartDateStr: string,
  beforeDateStr: string,
): DevTask[] {
  return tasks.filter(
    (task) =>
      !task.completed &&
      task.executionDate !== null &&
      task.executionDate >= weekStartDateStr &&
      task.executionDate < beforeDateStr,
  )
}
