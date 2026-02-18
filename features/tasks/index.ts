export { TaskDialog } from './components/TaskDialog'
export { TaskForm } from './components/TaskForm'
export { TaskItem } from './components/TaskItem'
export { TaskList } from './components/TaskList'
export { RecurringTaskDeleteDialog } from './components/RecurringTaskDeleteDialog'
export { useTasks } from './hooks/useTasks'
export {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
  updateOverdueTasksToToday,
  expandRecurringTasks,
  toTasksWithNextOccurrenceOnly,
  getNextOccurrenceDate,
  getNextOccurrenceAfter,
  groupTasks,
  getTodayTasks,
  getTasksForDate,
  getTasksForWeek,
  getTasksCompletedInWeek,
  getOverdueTasksInWeek,
  getRecurrenceLabel,
  DATE_LABEL_STYLES,
  DEFAULT_DATE_STYLE,
} from './lib'
export type { TaskGroup } from './lib'
export type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from './types/task'
