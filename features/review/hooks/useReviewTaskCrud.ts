import { useState, useCallback } from 'react'
import { mutate } from 'swr'
import { useTasks } from '@/features/tasks'
import { updateDevTask, deleteDevTask } from '@/features/dev/tasks'
import { SWR_KEYS } from '@/lib/swr-keys'
import type { Task, CreateTaskInput } from '@/features/tasks'
import type { ReviewMode } from '../types/review-completion'

export function useReviewTaskCrud(mode: ReviewMode) {
  const { updateTask, deleteTask, toggleTaskCompletion } = useTasks()

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const handleToggleCompletion = useCallback(async (task: Task) => {
    if (mode === 'life') {
      await toggleTaskCompletion(task.id, !task.completed)
    } else {
      await updateDevTask(task.id, { completed: !task.completed })
      await mutate(SWR_KEYS.devTasks)
    }
  }, [mode, toggleTaskCompletion])

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task)
  }, [])

  const handleEditSubmit = useCallback(async (input: CreateTaskInput) => {
    if (!editingTask) return
    if (mode === 'life') {
      await updateTask(editingTask.id, input)
    } else {
      await updateDevTask(editingTask.id, input)
      await mutate(SWR_KEYS.devTasks)
    }
    setEditingTask(null)
  }, [editingTask, mode, updateTask])

  const performDelete = useCallback(async (id: number) => {
    if (mode === 'life') {
      await deleteTask(id)
    } else {
      await deleteDevTask(id)
      await mutate(SWR_KEYS.devTasks)
    }
  }, [mode, deleteTask])

  const handleDelete = useCallback(async (task: Task) => {
    if (task.recurrenceRule) {
      setDeletingTask(task)
    } else {
      try {
        await performDelete(task.id)
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }
  }, [performDelete])

  const handleRecurringDeleteConfirm = useCallback(async (deleteMode: 'single' | 'all') => {
    if (!deletingTask) return
    if (deleteMode === 'all') {
      await performDelete(deletingTask.id)
    } else {
      if (mode === 'life') {
        const excluded = [...(deletingTask.recurrenceExcludedDates ?? []), deletingTask.executionDate]
          .filter((d): d is string => Boolean(d))
        await updateTask(deletingTask.id, { recurrenceExcludedDates: excluded })
      } else {
        await performDelete(deletingTask.id)
      }
    }
    setDeletingTask(null)
  }, [deletingTask, mode, updateTask, performDelete])

  const handleUpdateExecutionDate = useCallback(async (
    task: Task,
    executionDate: string | null,
  ) => {
    if (mode === 'life') {
      await updateTask(task.id, { executionDate })
    } else {
      await updateDevTask(task.id, { executionDate })
      await mutate(SWR_KEYS.devTasks)
    }
  }, [mode, updateTask])

  return {
    editingTask,
    deletingTask,
    setEditingTask,
    setDeletingTask,
    handleToggleCompletion,
    handleEdit,
    handleEditSubmit,
    handleDelete,
    handleRecurringDeleteConfirm,
    handleUpdateExecutionDate,
  }
}
