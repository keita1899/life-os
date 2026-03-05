'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface DroppableGroupProps {
  groupKey: string
  isDropTarget: boolean
  children: React.ReactNode
}

/** グループコンテナをドロップ可能にするラッパー */
export function DroppableGroup({
  groupKey,
  isDropTarget,
  children,
}: DroppableGroupProps) {
  const { setNodeRef } = useDroppable({ id: `group-${groupKey}` })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg transition-all duration-200',
        isDropTarget && 'bg-primary/8 ring-2 ring-primary/50 dark:bg-primary/15',
      )}
    >
      {children}
    </div>
  )
}
