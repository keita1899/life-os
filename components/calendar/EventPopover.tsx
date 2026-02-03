'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_EMOJI,
} from '@/lib/events/constants'
import {
  isBarcelonaMatch,
  getBarcelonaMatchBackground,
  BARCELONA_MATCH_TITLE_COLOR,
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
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => checkDarkMode()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
    } else {
      mediaQuery.addListener(handleMediaChange)
    }
    return () => {
      observer.disconnect()
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  }, [])

  const isBarca = isBarcelonaMatch(event)
  const ROYAL_BLUE_BG =
    'rounded-md bg-blue-900/10 p-2 dark:bg-blue-900/20'

  const categoryLabel = isBarca
    ? '⚽ Barca'
    : event.category
      ? `${EVENT_CATEGORY_EMOJI[event.category]} ${EVENT_CATEGORY_LABELS[event.category]}`
      : null

  return (
    <div
      className={cn(
        'space-y-3 rounded-md p-2',
        !isBarca && ROYAL_BLUE_BG,
      )}
      style={
        isBarca
          ? { background: getBarcelonaMatchBackground(isDark) }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="min-w-0 flex-1 text-sm font-semibold text-stone-900 dark:text-stone-100"
          style={isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined}
        >
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
      <div
        className={cn(
          'space-y-2 text-xs',
          isBarca ? 'text-white/80' : 'text-muted-foreground',
        )}
      >
        <EventDateTime event={event} />
        {event.allDay && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span className="rounded-md px-2 py-0.5 text-muted-foreground">
              終日
            </span>
          </div>
        )}
        {categoryLabel && (
          <div className="flex items-center gap-2">
            <span className="rounded-md px-2 py-0.5 text-muted-foreground">
              {categoryLabel}
            </span>
          </div>
        )}
        {event.description && (
          <div className="pt-1">
            <p
              className={cn(
                'text-xs',
                isBarca ? 'text-white/80' : 'text-stone-600 dark:text-stone-400',
              )}
            >
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
