'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineCreateButtonProps {
  label: string
  onClick: () => void
  className?: string
}

export function InlineCreateButton({
  label,
  onClick,
  className,
}: InlineCreateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group/create flex w-full items-center gap-3 rounded-lg border border-dashed border-stone-300/60 px-4 py-3 transition-colors',
        'text-muted-foreground hover:border-stone-400/80 hover:bg-stone-100/50 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'dark:border-stone-700/50 dark:hover:border-stone-600/70 dark:hover:bg-stone-800/30',
        className,
      )}
    >
      <Plus className="h-4 w-4 shrink-0 text-muted-foreground group-hover/create:text-foreground transition-colors" />
      <span className="text-sm">{label}</span>
    </button>
  )
}
