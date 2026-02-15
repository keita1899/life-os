'use client'

import { useEffect, useState } from 'react'
import { Calendar, FileText, Pencil, Repeat, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EVENT_ITEM_BG,
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_EMOJI,
} from '@/features/events'
import {
  isBarcelonaMatch,
  getBarcelonaMatchBackground,
  BARCELONA_MATCH_TITLE_COLOR,
  BARCELONA_MATCH_TEXT_COLOR,
} from '@/lib/football'
import { formatEventTime } from '@/features/events'
import { EventDateTime, type Event } from '@/features/events'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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

  const categoryLabel = isBarca
    ? '⚽ Barca'
    : event.category
      ? `${EVENT_CATEGORY_EMOJI[event.category]} ${EVENT_CATEGORY_LABELS[event.category]}`
      : null

  return (
    <div
      className={cn(
        'space-y-3 rounded-md p-2',
        !isBarca && EVENT_ITEM_BG,
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
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger
                  className={cn(
                    'py-1 text-xs hover:no-underline',
                    isBarca ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span>説明</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <div
                    className={cn(
                      'text-xs whitespace-pre-wrap break-words',
                      isBarca ? 'text-white/80' : 'text-stone-600 dark:text-stone-400',
                    )}
                  >
                    {event.description}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  )
}

const EVENT_TRIGGER_CLASS = {
  month:
    'flex w-full items-center gap-0.5 truncate rounded px-1 py-0.5 text-left text-xs hover:opacity-80',
  week: 'flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs hover:opacity-80',
} as const

interface EventPopoverWrapperProps {
  event: Event
  variant: 'month' | 'week'
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onOpenChange?: (open: boolean) => void
}

export function EventPopoverWrapper({
  event,
  variant,
  onEdit,
  onDelete,
  onOpenChange,
}: EventPopoverWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const isBarca = isBarcelonaMatch(event)
  const timeStr = !event.allDay ? formatEventTime(event) : null
  const title = event.title

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            EVENT_TRIGGER_CLASS[variant],
            isBarca
              ? BARCELONA_MATCH_TEXT_COLOR
              : `${EVENT_ITEM_BG} text-stone-900 dark:text-stone-100`,
          )}
          style={
            isBarca
              ? { background: getBarcelonaMatchBackground(isDark) }
              : undefined
          }
          title={title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {variant === 'month' ? (
            <>
              {event.recurrenceRule && (
                <Repeat
                  className="h-3 w-3 shrink-0 opacity-70"
                  aria-label="繰り返し"
                />
              )}
              {timeStr && (
                <span className="shrink-0 text-[10px] opacity-70">{timeStr}</span>
              )}
              <span
                className="min-w-0 flex-1 truncate"
                style={isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined}
              >
                {title}
              </span>
            </>
          ) : (
            <>
              {event.recurrenceRule && (
                <Repeat
                  className="h-3 w-3 shrink-0 opacity-70"
                  aria-label="繰り返し"
                />
              )}
              {timeStr && (
                <span className="shrink-0 text-[10px] opacity-70">{timeStr}</span>
              )}
              <span
                className="min-w-0 flex-1 font-medium line-clamp-2"
                style={
                  isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined
                }
              >
                {title}
              </span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <EventPopoverContent
          event={event}
          onEdit={
            onEdit
              ? (e) => {
                  handleOpenChange(false)
                  onEdit(e)
                }
              : undefined
          }
          onDelete={
            onDelete
              ? (e) => {
                  handleOpenChange(false)
                  onDelete(e)
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  )
}
