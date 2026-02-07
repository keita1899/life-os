'use client'

import { useDroppable } from '@dnd-kit/core'

interface EmptyListDroppableProps {
  id: string
  children: React.ReactNode
}

export function EmptyListDroppable({ id, children }: EmptyListDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] rounded-lg border-2 border-dashed p-4 transition-colors ${
        isOver
          ? 'border-primary bg-primary/10'
          : 'border-stone-300 dark:border-stone-700'
      }`}
    >
      {children}
    </div>
  )
}

interface InvisibleDroppableProps {
  id: string
  children: React.ReactNode
}

export function InvisibleDroppable({ id, children }: InvisibleDroppableProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  )
}

interface FocusListContainerProps {
  children: React.ReactNode
  isOver: boolean
  hasItems: boolean
}

export function FocusListContainer({ children, isOver, hasItems }: FocusListContainerProps) {
  const { setNodeRef } = useDroppable({
    id: 'focus-tasks-list-container',
  })

  if (hasItems) {
    return (
      <div
        ref={setNodeRef}
        className={`rounded-lg transition-colors ${
          isOver ? 'bg-primary/10' : ''
        }`}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
        isOver
          ? 'border-primary bg-primary/10'
          : 'border-stone-300 dark:border-stone-700'
      }`}
    >
      {children}
    </div>
  )
}
