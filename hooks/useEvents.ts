import useSWR from 'swr'
import { mutate } from 'swr'
import { createEvent, getAllEvents } from '@/lib/events'
import type { Event, CreateEventInput } from '@/lib/types/event'
import { fetcher } from '@/lib/swr'

const eventsKey = 'events'

export function useEvents() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Event[]>(eventsKey, () => fetcher(() => getAllEvents()))

  const handleCreateEvent = async (input: CreateEventInput) => {
    await createEvent(input)
    await mutate(eventsKey)
  }

  return {
    events: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch events'
      : null,
    createEvent: handleCreateEvent,
    refreshEvents: () => mutate(eventsKey),
  }
}
