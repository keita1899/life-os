import useSWR, { useSWRConfig } from 'swr'
import { createEvent, getAllEvents, updateEvent, deleteEvent } from '../lib'
import type { Event, CreateEventInput, UpdateEventInput } from '../types/event'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useEvents() {
  const { data = [], error, isLoading } = useSWR<Event[]>(
    SWR_KEYS.events,
    () => fetcher(() => getAllEvents()),
  )
  const { mutate } = useSWRConfig()

  const handleCreateEvent = async (input: CreateEventInput) => {
    const result = await createEvent(input)
    await mutate(
      SWR_KEYS.events,
      (current: Event[] | undefined) => [...(current ?? []), result],
      { revalidate: false },
    )
    return result
  }

  const handleUpdateEvent = async (id: number, input: UpdateEventInput) => {
    const result = await updateEvent(id, input)
    await mutate(
      SWR_KEYS.events,
      (current: Event[] | undefined) =>
        (current ?? []).map((e) => (e.id === id ? result : e)),
      { revalidate: false },
    )
    return result
  }

  const handleDeleteEvent = async (id: number) => {
    await mutate(
      SWR_KEYS.events,
      async (current: Event[] | undefined) => {
        await deleteEvent(id)
        return (current ?? []).filter((e) => e.id !== id)
      },
      {
        optimisticData: (current: Event[] | undefined) =>
          (current ?? []).filter((e) => e.id !== id),
        revalidate: false,
        rollbackOnError: true,
      },
    )
    return true
  }

  return {
    events: data,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch events') : null,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    refreshEvents: () => mutate(SWR_KEYS.events),
  }
}
