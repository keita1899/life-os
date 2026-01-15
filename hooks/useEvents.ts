import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
} from '@/lib/events'
import type {
  Event,
  CreateEventInput,
  UpdateEventInput,
} from '@/lib/types/event'
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

  const handleUpdateEvent = async (id: number, input: UpdateEventInput) => {
    await updateEvent(id, input)
    await mutate(eventsKey)
  }

  const handleDeleteEvent = async (id: number) => {
    await deleteEvent(id)
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
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    refreshEvents: () => mutate(eventsKey),
  }
}
