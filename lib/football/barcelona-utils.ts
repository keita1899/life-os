import type { EventCategory } from '../types/event'

export function isBarcelonaMatch(event: {
  title: string
  category: EventCategory
}): boolean {
  return event.category === 'sports' && event.title.includes('FC Barcelona')
}
