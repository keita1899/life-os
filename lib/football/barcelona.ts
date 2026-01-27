import { invoke } from '@tauri-apps/api/core'
import { parseICal, type ICalEvent } from '../ical/parser'
import { createEvent, deleteEventsByCategory } from '../events/event'

function normalizeICalUrl(url: string): string {
  if (url.startsWith('webcal://')) {
    return url.replace('webcal://', 'https://')
  }
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  return url
}

export async function fetchBarcelonaMatchesFromICal(
  icalUrl: string,
): Promise<ICalEvent[]> {
  const normalizedUrl = normalizeICalUrl(icalUrl)
  const icalContent = await invoke<string>('fetch_ical', { url: normalizedUrl })
  return parseICal(icalContent)
}

export async function syncBarcelonaMatches(icalUrl: string): Promise<number> {
  const matches = await fetchBarcelonaMatchesFromICal(icalUrl)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const futureMatches = matches.filter((match) => {
    const matchDate = new Date(match.startDatetime)
    return matchDate >= today
  })

  await deleteEventsByCategory('sports')

  for (const match of futureMatches) {
    await createEvent({
      title: match.title,
      startDatetime: match.startDatetime,
      endDatetime: match.endDatetime,
      allDay: false,
      category: 'sports',
      description: match.description,
    })
  }

  return futureMatches.length
}
