import useSWR from 'swr'
import { mutate } from 'swr'
import { createEvent, getAllEvents, updateEvent, deleteEvent } from '../lib'
import type { Event, CreateEventInput, UpdateEventInput } from '../types/event'
import { fetcher } from '@/lib/swr'

const eventsKey = 'events'

export function useEvents() {
  const { data = [], error, isLoading } = useSWR<Event[]>(
    eventsKey,
    () => fetcher(() => getAllEvents()),
  )

  const handleCreateEvent = async (input: CreateEventInput) => {
    const result = await createEvent(input)
    await mutate(eventsKey)
    return result
  }

  const handleUpdateEvent = async (id: number, input: UpdateEventInput) => {
    const result = await updateEvent(id, input)
    await mutate(eventsKey)
    return result
  }

  const handleDeleteEvent = async (id: number) => {
    await deleteEvent(id)
    await mutate(eventsKey)
    return true
  }

  return {
    events: data,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch events') : null,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    refreshEvents: () => mutate(eventsKey),
  }
}
