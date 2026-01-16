import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import type { Event } from '@/lib/types/event'

export type EventGroup = {
  key: string
  title: string
  events: Event[]
}

const GROUP_KEYS = {
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  OVERDUE: 'overdue',
} as const

function getDateStrings() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    today,
    tomorrow,
    todayStr: format(today, 'yyyy-MM-dd'),
    tomorrowStr: format(tomorrow, 'yyyy-MM-dd'),
  }
}

function createInitialGroups(): {
  todayGroup: EventGroup
  tomorrowGroup: EventGroup
  overdueGroup: EventGroup
} {
  return {
    todayGroup: { key: GROUP_KEYS.TODAY, title: '今日', events: [] },
    tomorrowGroup: { key: GROUP_KEYS.TOMORROW, title: '明日', events: [] },
    overdueGroup: { key: GROUP_KEYS.OVERDUE, title: '過去', events: [] },
  }
}

function getEventDateString(event: Event): string {
  const eventStartDate = parseISO(event.startDatetime)
  eventStartDate.setHours(0, 0, 0, 0)
  return format(eventStartDate, 'yyyy-MM-dd')
}

function categorizeEvent(
  event: Event,
  todayStr: string,
  tomorrowStr: string,
  today: Date,
): 'today' | 'tomorrow' | 'overdue' | 'future' {
  const eventDateStr = getEventDateString(event)
  const eventStartDate = parseISO(event.startDatetime)
  eventStartDate.setHours(0, 0, 0, 0)

  if (eventDateStr === todayStr) {
    return 'today'
  }
  if (eventDateStr === tomorrowStr) {
    return 'tomorrow'
  }
  if (eventStartDate < today) {
    return 'overdue'
  }
  return 'future'
}

function createDateGroup(dateStr: string): EventGroup {
  return {
    key: dateStr,
    title: format(parseISO(dateStr), 'yyyy年M月d日(E)', { locale: ja }),
    events: [],
  }
}

export function groupEvents(events: Event[]): EventGroup[] {
  const { today, todayStr, tomorrowStr } = getDateStrings()
  const { todayGroup, tomorrowGroup, overdueGroup } = createInitialGroups()
  const dateGroups = new Map<string, Event[]>();

  events.forEach((event) => {
    const category = categorizeEvent(event, todayStr, tomorrowStr, today)

    switch (category) {
      case 'today':
        todayGroup.events.push(event)
        break
      case 'tomorrow':
        tomorrowGroup.events.push(event)
        break
      case 'overdue':
        overdueGroup.events.push(event)
        break
      case 'future': {
        const eventDateStr = getEventDateString(event)
        if (!dateGroups.has(eventDateStr)) {
          dateGroups.set(eventDateStr, [])
        }
        dateGroups.get(eventDateStr)!.push(event)
        break
      }
    }
  })

  const sortedDateGroups = Array.from(dateGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, groupEvents]) => ({
      ...createDateGroup(dateStr),
      events: groupEvents,
    }))

  return [todayGroup, tomorrowGroup, overdueGroup, ...sortedDateGroups].filter(
    (group) => group.events.length > 0,
  )
}
