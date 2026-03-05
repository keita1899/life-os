import useSWR, { useSWRConfig } from 'swr'
import { createEvent, getAllEvents, updateEvent, deleteEvent, reorderEvents as reorderEventsDb } from '../lib'
import type { Event, CreateEventInput, UpdateEventInput } from '../types/event'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useEvents() {
  const { data = [], error, isLoading } = useSWR<Event[]>(
    SWR_KEYS.events,
    () => getAllEvents(),
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

  const handleReorderEvents = async (updates: { id: number; order: number }[]) => {
    await reorderEventsDb(updates)
    await mutate(
      SWR_KEYS.events,
      (current: Event[] | undefined) => {
        if (!current) return current
        const orderMap = new Map(updates.map((u) => [u.id, u.order]))
        return [...current].map((e) => {
          const newOrder = orderMap.get(e.id)
          return newOrder !== undefined ? { ...e, order: newOrder } : e
        }).sort((a, b) => a.order - b.order)
      },
      { revalidate: false },
    )
  }

  return {
    events: data,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch events') : null,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    reorderEvents: handleReorderEvents,
    refreshEvents: () => mutate(SWR_KEYS.events),
  }
}
