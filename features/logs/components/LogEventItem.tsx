'use client'

import { useMemo, useEffect, useState } from 'react'
import { Calendar, FileText, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
} from '@/lib/football'
import type { Event } from '@/features/events'

interface LogEventItemProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

export function LogEventItem({ event, onEdit, onDelete }: LogEventItemProps) {
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

  const startTime = useMemo(() => {
    if (event.allDay) return null
    const startDate = parseISO(event.startDatetime)
    const time = format(startDate, 'HH:mm', { locale: ja })
    return time !== '00:00' ? time : null
  }, [event.startDatetime, event.allDay])

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg p-4',
        !isBarca && EVENT_ITEM_BG,
      )}
      style={
        isBarca
          ? { background: getBarcelonaMatchBackground(isDark) }
          : undefined
      }
    >
      <div className="mt-0.5 flex min-w-[60px] items-center gap-1 text-sm font-medium">
        {startTime ? (
          <>
            <Clock className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
            <span className="text-sky-700 dark:text-sky-300">{startTime}</span>
          </>
        ) : (
          <div className="h-4 w-4 shrink-0" />
        )}
      </div>
      <div className="mt-0.5">
        <Calendar
          className={cn(
            'h-5 w-5',
            isBarca ? 'text-white/80' : 'text-sky-700 dark:text-sky-300',
          )}
        />
      </div>
      <div className="flex-1">
        <div
          className="text-sm font-medium text-stone-900 dark:text-stone-100"
          style={isBarca ? { color: BARCELONA_MATCH_TITLE_COLOR } : undefined}
        >
          {event.title}
        </div>
        <div
          className={cn(
            'mt-2 flex items-center gap-4 text-xs',
            isBarca ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {categoryLabel && (
            <span className="rounded-md px-2 py-0.5 text-muted-foreground">
              {categoryLabel}
            </span>
          )}
          {event.allDay && (
            <span className="rounded-md px-2 py-0.5 text-muted-foreground">
              終日
            </span>
          )}
        </div>
        {event.description && (
          <div className="mt-2">
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
                      isBarca ? 'text-white/80' : 'text-muted-foreground',
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
      <div className="flex min-w-[40px] items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <EditDeleteDropdownMenu
          onEdit={onEdit ? () => onEdit(event) : undefined}
          onDelete={onDelete ? () => onDelete(event) : undefined}
        />
      </div>
    </div>
  )
}
