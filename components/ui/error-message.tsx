'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
  className?: string
}

export const ErrorMessage = ({
  message,
  onDismiss,
  className,
}: ErrorMessageProps) => {
  if (!message) return null

  return (
    <div
      className={cn(
        'mb-4 flex items-center justify-between rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive',
        className,
      )}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </button>
      )}
    </div>
  )
}
