export interface ICalEvent {
  title: string
  startDatetime: string
  endDatetime: string | null
  description: string | null
}

function parseDateTime(dateTimeStr: string): string {
  if (dateTimeStr.endsWith('Z')) {
    const dateStr = dateTimeStr
      .slice(0, -1)
      .replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z')
    const utcDate = new Date(dateStr)
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000)
    return jstDate.toISOString().slice(0, 19)
  }

  if (dateTimeStr.includes('T') && dateTimeStr.length >= 15) {
    const dateStr = dateTimeStr.replace(
      /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
      '$1-$2-$3T$4:$5:$6',
    )
    return dateStr.slice(0, 19)
  }

  if (dateTimeStr.length === 8) {
    return `${dateTimeStr.slice(0, 4)}-${dateTimeStr.slice(4, 6)}-${dateTimeStr.slice(6, 8)}T00:00:00`
  }

  return dateTimeStr
}

function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

export function parseICal(icalContent: string): ICalEvent[] {
  const events: ICalEvent[] = []
  const lines = icalContent.split(/\r?\n/)
  let currentEvent: Partial<ICalEvent> | null = null
  let currentKey: string | null = null
  let currentValue: string = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (currentKey && currentValue) {
        currentValue += line.trim()
      }
      continue
    }

    if (currentKey && currentValue && currentEvent) {
      const unescapedValue = unescapeICalText(currentValue)
      if (currentKey === 'SUMMARY') {
        currentEvent.title = unescapedValue
      } else if (currentKey === 'DTSTART') {
        currentEvent.startDatetime = parseDateTime(unescapedValue)
      } else if (currentKey === 'DTEND') {
        currentEvent.endDatetime = parseDateTime(unescapedValue)
      } else if (currentKey === 'DESCRIPTION') {
        currentEvent.description = unescapedValue
      }
      currentKey = null
      currentValue = ''
    }

    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {}
      continue
    }

    if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.title && currentEvent.startDatetime) {
        events.push({
          title: currentEvent.title,
          startDatetime: currentEvent.startDatetime,
          endDatetime: currentEvent.endDatetime || null,
          description: currentEvent.description || null,
        })
      }
      currentEvent = null
      continue
    }

    if (!currentEvent) continue

    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).split(';')[0]
      const value = line.substring(colonIndex + 1)

      if (
        key === 'SUMMARY' ||
        key === 'DTSTART' ||
        key === 'DTEND' ||
        key === 'DESCRIPTION'
      ) {
        currentKey = key
        currentValue = value
      }
    }
  }

  return events
}
