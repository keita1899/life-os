import type { EventCategory } from '@/lib/types/event'

export const EVENT_CATEGORY_LABELS: Record<NonNullable<EventCategory>, string> = {
  work: '仕事',
  life: '生活',
  housework: '家事',
  social: '交際',
  play: '遊び',
  hobby: '趣味',
  health: '健康',
  procedure: '手続き',
  birthday: '誕生日',
  anniversary: '記念日',
  sports: 'スポーツ',
}

export const EVENT_CATEGORY_COLORS: Record<NonNullable<EventCategory>, string> = {
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  life: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  housework:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  play: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  hobby:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  procedure: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  birthday: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  anniversary:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  sports: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
}

export const EVENT_CATEGORIES: Array<{ value: EventCategory; label: string }> = [
  { value: null, label: 'カテゴリーなし' },
  { value: 'work', label: EVENT_CATEGORY_LABELS.work },
  { value: 'life', label: EVENT_CATEGORY_LABELS.life },
  { value: 'housework', label: EVENT_CATEGORY_LABELS.housework },
  { value: 'social', label: EVENT_CATEGORY_LABELS.social },
  { value: 'play', label: EVENT_CATEGORY_LABELS.play },
  { value: 'hobby', label: EVENT_CATEGORY_LABELS.hobby },
  { value: 'health', label: EVENT_CATEGORY_LABELS.health },
  { value: 'procedure', label: EVENT_CATEGORY_LABELS.procedure },
  { value: 'birthday', label: EVENT_CATEGORY_LABELS.birthday },
  { value: 'anniversary', label: EVENT_CATEGORY_LABELS.anniversary },
  { value: 'sports', label: EVENT_CATEGORY_LABELS.sports },
]
