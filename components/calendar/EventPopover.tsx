'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_COLORS,
} from '@/lib/events/constants'
import {
  isBarcelonaMatch,
  getBarcelonaMatchBackground,
  BARCELONA_MATCH_TEXT_COLOR,
} from '@/lib/football'
import { EventDateTime } from '@/components/events/EventDateTime'
import type { Event } from '@/lib/types/event'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface EventPopoverContentProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

export function EventPopoverContent({
  event,
  onEdit,
  onDelete,
}: EventPopoverContentProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(
        document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches,
      )
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
          {event.title}
        </h3>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onEdit(event)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">編集</span>
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <EventDateTime event={event} />
        {event.allDay && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              終日
            </span>
          </div>
        )}
        {event.category && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-md px-2 py-0.5',
                isBarcelonaMatch(event)
                  ? BARCELONA_MATCH_TEXT_COLOR
                  : EVENT_CATEGORY_COLORS[event.category],
              )}
              style={
                isBarcelonaMatch(event)
                  ? {
                      background: getBarcelonaMatchBackground(isDark),
                    }
                  : undefined
              }
            >
              {EVENT_CATEGORY_LABELS[event.category]}
            </span>
          </div>
        )}
        {event.description && (
          <div className="pt-1">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
