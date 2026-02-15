import type { EventCategory } from '@/features/events'

export function isBarcelonaMatch(event: {
  title: string
  category: EventCategory
}): boolean {
  return (
    event.category === 'barca' ||
    (event.category === 'sports' && event.title.includes('FC Barcelona'))
  )
}
