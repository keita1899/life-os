'use client'

import { useMemo } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { useEvents } from '@/features/events'
import { expandRecurringEvents } from '@/features/events'
import { getEventsForDateSorted } from '@/features/logs'
import { LogEventsSection } from '@/features/logs'

interface MorningEventsStepProps {
  today: Date
}

export function MorningEventsStep({ today }: MorningEventsStepProps) {
  const { events: allEvents } = useEvents()

  const events = useMemo(() => {
    const rangeStart = startOfDay(today)
    const rangeEnd = endOfDay(today)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return getEventsForDateSorted(expanded, today)
  }, [allEvents, today])

  return (
    <div className="space-y-5">
      <LogEventsSection events={events} />
    </div>
  )
}
