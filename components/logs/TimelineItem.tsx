'use client'

import { LogEventItem } from '@/components/logs/LogEventItem'
import { HabitItem } from '@/components/logs/HabitItem'
import { LogTaskItem } from '@/components/logs/LogTaskItem'
import type { Event } from '@/lib/types/event'
import type { Habit } from '@/lib/types/habit'
import type { Task } from '@/lib/types/task'

export type TimelineItemType = 
  | { type: 'event'; data: Event }
  | { type: 'habit'; data: Habit; completed: boolean }
  | { type: 'task'; data: Task }

interface TimelineItemProps {
  item: TimelineItemType
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
  onToggleHabit?: (habit: Habit) => void
  onToggleTask?: (task: Task) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
}

export function TimelineItem({
  item,
  onEditEvent,
  onDeleteEvent,
  onToggleHabit,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TimelineItemProps) {
  switch (item.type) {
    case 'event':
      return (
        <LogEventItem
          event={item.data}
          onEdit={onEditEvent}
          onDelete={onDeleteEvent}
        />
      )
    case 'habit':
      return (
        <HabitItem
          habit={item.data}
          completed={item.completed}
          onToggle={onToggleHabit!}
        />
      )
    case 'task':
      return (
        <LogTaskItem
          task={item.data}
          onToggleCompletion={onToggleTask}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      )
  }
}
