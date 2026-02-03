'use client'

import { useEffect, useState } from 'react'
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_COLORS,
} from '@/lib/events/constants'
import {
  isBarcelonaMatch,
  getBarcelonaMatchBackground,
  BARCELONA_MATCH_TITLE_COLOR,
} from '@/lib/football'
import { EventDateTime } from './EventDateTime'
import type { Event } from '@/lib/types/event'

interface EventItemProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

export function EventItem({ event, onEdit, onDelete }: EventItemProps) {
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

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        isBarca
          ? 'border-transparent text-white'
          : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900',
      )}
      style={
        isBarca ? { background: getBarcelonaMatchBackground(isDark) } : undefined
      }
    >
      <div className="mt-0.5">
        <Calendar
          className={cn('h-5 w-5', isBarca ? 'text-white' : 'text-blue-500')}
        />
      </div>
      <div className="flex-1">
        <div
          className={cn(
            'text-sm font-medium',
            !isBarca && 'text-stone-900 dark:text-stone-100',
          )}
          style={isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined}
        >
          {event.title}
        </div>
        <div
          className={cn(
            'mt-2 flex items-center gap-4 text-xs',
            isBarca ? 'text-white/90' : 'text-muted-foreground',
          )}
        >
          <EventDateTime event={event} />
          {event.category && (
            <span
              className={cn(
                'rounded-md px-2 py-0.5',
                !isBarca && EVENT_CATEGORY_COLORS[event.category],
                isBarca && 'bg-white/20',
              )}
              style={
                isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined
              }
            >
              {isBarca ? 'Barca' : EVENT_CATEGORY_LABELS[event.category]}
            </span>
          )}
          {event.allDay && (
            <span
              className={cn(
                'rounded-md px-2 py-0.5',
                isBarca
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
              )}
            >
              終日
            </span>
          )}
        </div>
        {event.description && (
          <div
            className={cn(
              'mt-2 text-xs',
              isBarca ? 'text-white/80' : 'text-muted-foreground',
            )}
          >
            {event.description}
          </div>
        )}
      </div>
      <div className="flex min-w-[40px] items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(event)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(event)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
