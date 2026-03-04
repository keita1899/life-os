import { useCallback } from 'react'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'

interface SortableItem {
  id: number
}

interface UseSortableListOptions<T extends SortableItem> {
  items: T[]
  onReorder: (updates: { id: number; order: number }[]) => Promise<void>
}

export function useSortableList<T extends SortableItem>({
  items,
  onReorder,
}: UseSortableListOptions<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(items, oldIndex, newIndex)
      const updates = reordered.map((item, i) => ({ id: item.id, order: i }))
      onReorder(updates)
    },
    [items, onReorder],
  )

  return {
    sensors,
    handleDragEnd,
  }
}
