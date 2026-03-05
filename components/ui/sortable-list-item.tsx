'use client'

import { type ReactNode, createContext, useContext } from 'react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface DragHandleContext {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
}

const SortableItemContext = createContext<DragHandleContext | null>(null)

interface SortableListItemProps {
  id: number
  children: ReactNode
  /** ドラッグ中に破線プレースホルダーを表示（DragOverlay と併用する場合に有効化） */
  ghostPlaceholder?: boolean
}

export function SortableListItem({
  id,
  children,
  ghostPlaceholder = false,
}: SortableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !ghostPlaceholder ? 0.5 : undefined,
  }

  return (
    <SortableItemContext.Provider value={{ attributes, listeners }}>
      <div
        ref={setNodeRef}
        style={style}
        className={isDragging && ghostPlaceholder ? 'opacity-30 rounded-lg border-2 border-dashed border-primary/40' : ''}
      >
        {children}
      </div>
    </SortableItemContext.Provider>
  )
}

export function SortableDragHandle() {
  const ctx = useContext(SortableItemContext)
  if (!ctx) return null

  return (
    <div
      {...ctx.attributes}
      {...ctx.listeners}
      className="flex shrink-0 cursor-grab items-center self-center px-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing touch-none"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </div>
  )
}
