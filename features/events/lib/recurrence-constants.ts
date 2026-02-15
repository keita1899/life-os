import type { RecurrenceRule } from '../types/event'

export const RECURRENCE_OPTIONS: { value: '' | RecurrenceRule; label: string }[] =
  [
    { value: '', label: 'なし' },
    { value: 'daily', label: '毎日' },
    { value: 'weekly', label: '毎週' },
    { value: 'monthly', label: '毎月' },
  ]

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1)
export const LAST_DAY_OF_MONTH = 0
