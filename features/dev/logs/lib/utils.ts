import { getYear, getMonth, startOfWeek } from 'date-fns'
import { formatDateISO } from '@/lib/date/formats'
import type {
  DevYearlyGoal,
  DevMonthlyGoal,
  DevWeeklyGoal,
} from '@/features/dev/goals'
import type { DevTask } from '@/features/dev/tasks'

export function getDevYearlyGoalsForDate(
  goals: DevYearlyGoal[],
  date: Date,
): DevYearlyGoal[] {
  const year = getYear(date)
  return goals.filter((goal) => goal.year === year)
}

export function getDevMonthlyGoalsForDate(
  goals: DevMonthlyGoal[],
  date: Date,
): DevMonthlyGoal[] {
  const year = getYear(date)
  const month = getMonth(date) + 1
  return goals.filter((goal) => goal.year === year && goal.month === month)
}

export function getDevWeeklyGoalsForDate(
  goals: DevWeeklyGoal[],
  date: Date,
  weekStartDay: number = 1,
): DevWeeklyGoal[] {
  const weekStartsOn = weekStartDay === 0 ? 0 : 1
  const weekStart = startOfWeek(date, { weekStartsOn })
  weekStart.setHours(0, 0, 0, 0)
  const weekStartDate = formatDateISO(weekStart)

  return goals.filter((goal) => goal.weekStartDate === weekStartDate)
}

function sortByProject(tasks: DevTask[]): DevTask[] {
  return [...tasks].sort((a, b) => {
    const aKey = a.projectId ?? -1
    const bKey = b.projectId ?? -1
    return aKey - bKey
  })
}

export function getDevTasksForDate(tasks: DevTask[], date: Date): DevTask[] {
  const dateStr = formatDateISO(date)
  const filteredTasks = tasks.filter(
    (task) => task.executionDate !== null && task.executionDate === dateStr,
  )

  const incompleteTasks = sortByProject(filteredTasks.filter((task) => !task.completed))
  const completedTasks = sortByProject(filteredTasks.filter((task) => task.completed))

  return [...incompleteTasks, ...completedTasks]
}
