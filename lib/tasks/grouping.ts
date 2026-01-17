import { formatDateDisplay } from '@/lib/date/formats'
import {
  getTodayDate,
  getTodayDateString,
  getTomorrowDateString,
  parseDateString,
} from '@/lib/date/formats'
import { categorizeDate } from '@/lib/date/labels'
import type { Task } from '@/lib/types/task'

export type TaskGroup = {
  key: string
  title: string
  tasks: Task[]
}

const GROUP_KEYS = {
  NONE: 'none',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
} as const

function createInitialGroups(): {
  noneGroup: TaskGroup
  todayGroup: TaskGroup
  tomorrowGroup: TaskGroup
  overdueGroup: TaskGroup
} {
  return {
    noneGroup: { key: GROUP_KEYS.NONE, title: '日付なし', tasks: [] },
    todayGroup: { key: GROUP_KEYS.TODAY, title: '今日', tasks: [] },
    tomorrowGroup: { key: GROUP_KEYS.TOMORROW, title: '明日', tasks: [] },
    overdueGroup: { key: GROUP_KEYS.OVERDUE, title: '期限切れ', tasks: [] },
  }
}

export function groupTasks(tasks: Task[]): TaskGroup[] {
  const today = getTodayDate()
  const todayStr = getTodayDateString()
  const tomorrowStr = getTomorrowDateString()

  const incompleteTasks: Task[] = []
  const completedTasks: Task[] = []

  tasks.forEach((task) => {
    if (task.completed) {
      completedTasks.push(task)
    } else {
      incompleteTasks.push(task)
    }
  })

  const { noneGroup, todayGroup, tomorrowGroup, overdueGroup } =
    createInitialGroups()
  const dateGroups = new Map<string, Task[]>()

  incompleteTasks.forEach((task) => {
    const category = categorizeDate(
      task.executionDate,
      todayStr,
      tomorrowStr,
      today,
    )

    switch (category) {
      case 'none':
        noneGroup.tasks.push(task)
        break
      case 'today':
        todayGroup.tasks.push(task)
        break
      case 'tomorrow':
        tomorrowGroup.tasks.push(task)
        break
      case 'overdue':
        overdueGroup.tasks.push(task)
        break
      case 'future': {
        const dateStr = task.executionDate!
        if (!dateGroups.has(dateStr)) {
          dateGroups.set(dateStr, [])
        }
        dateGroups.get(dateStr)!.push(task)
        break
      }
    }
  })

  const sortedDateGroups = Array.from(dateGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, groupTasks]) => ({
      key: dateStr,
      title: formatDateDisplay(dateStr),
      tasks: groupTasks,
    }))

  const result: TaskGroup[] = [
    todayGroup,
    tomorrowGroup,
    noneGroup,
    overdueGroup,
    ...sortedDateGroups,
    {
      key: GROUP_KEYS.COMPLETED,
      title: '完了済み',
      tasks: completedTasks,
    },
  ]

  return result
}
