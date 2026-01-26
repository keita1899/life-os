import { getTodayDate, getTodayDateString, getTomorrowDateString } from '@/lib/date/formats'
import { categorizeDate } from '@/lib/date/labels'
import type { Task } from '@/lib/types/task'
import type { DevTask } from '@/lib/types/dev-task'

export function getTodayTasks(tasks: Task[]): Task[] {
  const today = getTodayDate()
  const todayStr = getTodayDateString()
  const tomorrowStr = getTomorrowDateString()

  return tasks.filter((task) => {
    if (task.completed) return false
    const category = categorizeDate(task.executionDate, todayStr, tomorrowStr, today)
    return category === 'today'
  })
}

export function getTodayDevTasks(tasks: DevTask[]): DevTask[] {
  const today = getTodayDate()
  const todayStr = getTodayDateString()
  const tomorrowStr = getTomorrowDateString()

  return tasks.filter((task) => {
    if (task.completed) return false
    const category = categorizeDate(task.executionDate, todayStr, tomorrowStr, today)
    return category === 'today'
  })
}
