'use client'

import { useMemo } from 'react'
import { useTasks, getTodayTasks } from '@/features/tasks'
import {
  FocusView,
  SortableTaskItem,
  DraggableAvailableTaskItem,
} from '@/features/focus'
import type { Task } from '@/features/tasks'

export default function FocusPage() {
  const { tasks, isLoading, error, updateTask } = useTasks()
  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks])

  return (
    <FocusView<Task>
      tasks={todayTasks}
      isLoading={isLoading}
      error={error}
      onCompleteTask={async (taskId) => {
        await updateTask(taskId, { completed: true })
      }}
      renderAvailableItem={(task, onToggle) => (
        <DraggableAvailableTaskItem task={task} onToggle={onToggle} />
      )}
      renderFocusItem={(task, index, onToggle, onRemove) => (
        <SortableTaskItem
          task={task}
          index={index}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      )}
    />
  )
}
