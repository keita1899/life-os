import { useState } from 'react'
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

interface UseFocusDragAndDropOptions {
  focusTaskIds: number[]
  availableTaskIds: number[]
  onMoveTaskToFocus: (taskId: number, targetIndex?: number) => void
  onMoveTaskToAvailable: (taskId: number, targetIndex?: number) => void
  onReorderFocusTasks: (activeId: number, overId: number) => void
  onReorderAvailableTasks: (activeId: number, overId: number) => void
}

export function useFocusDragAndDrop({
  focusTaskIds,
  availableTaskIds,
  onMoveTaskToFocus,
  onMoveTaskToAvailable,
  onReorderFocusTasks,
  onReorderAvailableTasks,
}: UseFocusDragAndDropOptions) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      setOverId(event.over.id)
    } else {
      setOverId(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeId = active.id as number
    const overId = over.id

    const isActiveInFocus = focusTaskIds.includes(activeId)
    const isActiveInAvailable = availableTaskIds.includes(activeId)

    if (typeof overId === 'string') {
      if ((overId === 'available-tasks-list' || overId === 'available-tasks-list-end') && isActiveInFocus) {
        onMoveTaskToAvailable(activeId)
      } else if (
        (overId === 'focus-tasks-list' ||
          overId === 'focus-tasks-list-end' ||
          overId === 'focus-tasks-list-container') &&
        !isActiveInFocus
      ) {
        onMoveTaskToFocus(activeId)
      }
      return
    }

    const overIdNum = overId as number
    const isOverInFocus = focusTaskIds.includes(overIdNum)
    const isOverInAvailable = availableTaskIds.includes(overIdNum)

    if (isActiveInFocus && isOverInFocus) {
      onReorderFocusTasks(activeId, overIdNum)
    } else if (!isActiveInFocus && isOverInFocus) {
      const overIndex = focusTaskIds.indexOf(overIdNum)
      onMoveTaskToFocus(activeId, overIndex)
    } else if (isActiveInFocus && isOverInAvailable) {
      const overIndex = availableTaskIds.indexOf(overIdNum)
      onMoveTaskToAvailable(activeId, overIndex)
    } else if (isActiveInAvailable && isOverInAvailable) {
      onReorderAvailableTasks(activeId, overIdNum)
    }
  }

  return {
    activeId,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}
