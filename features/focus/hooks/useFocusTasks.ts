import { useMemo, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

interface TaskLike {
  id: number
}

interface UseFocusTasksOptions<T extends TaskLike> {
  allTasks: T[]
}

export function useFocusTasks<T extends TaskLike>({ allTasks }: UseFocusTasksOptions<T>) {
  const [focusTaskIds, setFocusTaskIds] = useState<number[]>([])
  const [availableTaskIds, setAvailableTaskIds] = useState<number[]>([])

  const [prevAllTasks, setPrevAllTasks] = useState(allTasks)
  const [prevFocusTaskIds, setPrevFocusTaskIds] = useState(focusTaskIds)
  if (allTasks !== prevAllTasks || focusTaskIds !== prevFocusTaskIds) {
    setPrevAllTasks(allTasks)
    setPrevFocusTaskIds(focusTaskIds)

    const focusTaskIdSet = new Set(focusTaskIds)
    const newAvailableTaskIds = allTasks
      .filter((task) => !focusTaskIdSet.has(task.id))
      .map((task) => task.id)

    const currentIdSet = new Set(availableTaskIds)
    const newSet = new Set(newAvailableTaskIds)

    if (availableTaskIds.length === 0 || !availableTaskIds.every((id) => newSet.has(id))) {
      setAvailableTaskIds(newAvailableTaskIds)
    } else {
      const ordered: number[] = []
      const unordered: number[] = []

      availableTaskIds.forEach((id) => {
        if (newSet.has(id)) {
          ordered.push(id)
        }
      })

      newAvailableTaskIds.forEach((id) => {
        if (!currentIdSet.has(id)) {
          unordered.push(id)
        }
      })

      setAvailableTaskIds([...ordered, ...unordered])
    }
  }

  const focusTasks = useMemo(() => {
    const taskMap = new Map(allTasks.map((task) => [task.id, task]))
    return focusTaskIds
      .map((id) => taskMap.get(id))
      .filter((task): task is T => task !== undefined)
  }, [allTasks, focusTaskIds])

  const availableTasks = useMemo(() => {
    const focusTaskIdSet = new Set(focusTaskIds)
    const filtered = allTasks.filter((task) => !focusTaskIdSet.has(task.id))

    if (availableTaskIds.length === 0) {
      return filtered
    }

    const taskMap = new Map(filtered.map((task) => [task.id, task]))
    const ordered: T[] = []
    const unordered: T[] = []

    availableTaskIds.forEach((id) => {
      const task = taskMap.get(id)
      if (task) {
        ordered.push(task)
        taskMap.delete(id)
      }
    })

    filtered.forEach((task) => {
      if (taskMap.has(task.id)) {
        unordered.push(task)
      }
    })

    return [...ordered, ...unordered]
  }, [allTasks, focusTaskIds, availableTaskIds])

  const toggleTask = (taskId: number) => {
    setFocusTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  const removeFromFocus = (taskId: number) => {
    setFocusTaskIds((prev) => prev.filter((id) => id !== taskId))
  }

  const moveTaskToFocus = (taskId: number, targetIndex?: number) => {
    setFocusTaskIds((items) => {
      if (targetIndex !== undefined) {
        const newItems = [...items]
        newItems.splice(targetIndex, 0, taskId)
        return newItems
      }
      return [...items, taskId]
    })
    setAvailableTaskIds((items) => items.filter((id) => id !== taskId))
  }

  const moveTaskToAvailable = (taskId: number, targetIndex?: number) => {
    setFocusTaskIds((items) => items.filter((id) => id !== taskId))
    setAvailableTaskIds((items) => {
      if (targetIndex !== undefined) {
        const newItems = [...items]
        newItems.splice(targetIndex, 0, taskId)
        return newItems
      }
      return [...items, taskId]
    })
  }

  const reorderFocusTasks = (activeId: number, overId: number) => {
    setFocusTaskIds((items) => {
      const oldIndex = items.indexOf(activeId)
      const newIndex = items.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const reorderAvailableTasks = (activeId: number, overId: number) => {
    setAvailableTaskIds((items) => {
      const oldIndex = items.indexOf(activeId)
      const newIndex = items.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return {
    focusTaskIds,
    availableTaskIds,
    focusTasks,
    availableTasks,
    toggleTask,
    removeFromFocus,
    moveTaskToFocus,
    moveTaskToAvailable,
    reorderFocusTasks,
    reorderAvailableTasks,
  }
}
