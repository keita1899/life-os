'use client'

import type { ReactElement } from 'react'
import { Button } from '@/components/ui/button'

export type FloatingAction = {
  id: string
  label: string
  icon: ReactElement
  onClick: () => void
}

interface FloatingActionButtonsProps {
  actions: FloatingAction[]
  className?: string
}

export function FloatingActionButtons({
  actions,
  className,
}: FloatingActionButtonsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className={className ?? 'fixed bottom-6 right-6 z-40 flex flex-col gap-2'}>
      {actions.map((action) => (
        <Button
          key={action.id}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={action.onClick}
        >
          {action.icon}
          <span className="sr-only">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}

