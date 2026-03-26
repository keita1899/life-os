import type { DevTask } from '@/features/dev/tasks'
import type { Task } from '@/features/tasks'

export function devTaskToTask(devTask: DevTask): Task {
  return {
    id: devTask.id,
    title: devTask.title,
    executionDate: devTask.executionDate,
    completed: devTask.completed,
    order: devTask.order,
    scheduledTime: null,
    recurrenceRule: null,
    recurrenceDaysOfWeek: null,
    recurrenceDayOfMonth: null,
    recurrenceEndDate: null,
    recurrenceExcludedDates: [],
    recurrenceCompletedDates: [],
    memo: devTask.memo,
    createdAt: devTask.createdAt,
    updatedAt: devTask.updatedAt,
  }
}
