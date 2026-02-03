import type { EventCategory } from '@/lib/types/event'

export const EVENT_CATEGORY_LABELS: Record<NonNullable<EventCategory>, string> = {
  work: '仕事',
  life: '生活',
  housework: '家事',
  social: '交際',
  play: '遊び',
  hobby: '趣味',
  health: '健康',
  travel: '旅行',
  sports: 'スポーツ',
  barca: 'Barca',
  procedure: '手続き',
  birthday: '誕生日',
  anniversary: '記念日',
}

export const EVENT_CATEGORY_EMOJI: Record<NonNullable<EventCategory>, string> = {
  work: '💼',
  life: '🏠',
  housework: '🧹',
  social: '👥',
  play: '🎮',
  hobby: '🎨',
  health: '💪',
  travel: '✈️',
  sports: '🏃',
  barca: '⚽',
  procedure: '📋',
  birthday: '🎂',
  anniversary: '💍',
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
  travel: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  sports: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  barca: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  procedure: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  birthday: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  anniversary:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export const EVENT_CATEGORIES: Array<{
  value: EventCategory
  label: string
  emoji: string
}> = [
  { value: null, label: 'カテゴリーなし', emoji: '' },
  { value: 'work', label: EVENT_CATEGORY_LABELS.work, emoji: EVENT_CATEGORY_EMOJI.work },
  { value: 'life', label: EVENT_CATEGORY_LABELS.life, emoji: EVENT_CATEGORY_EMOJI.life },
  { value: 'housework', label: EVENT_CATEGORY_LABELS.housework, emoji: EVENT_CATEGORY_EMOJI.housework },
  { value: 'social', label: EVENT_CATEGORY_LABELS.social, emoji: EVENT_CATEGORY_EMOJI.social },
  { value: 'hobby', label: EVENT_CATEGORY_LABELS.hobby, emoji: EVENT_CATEGORY_EMOJI.hobby },
  { value: 'play', label: EVENT_CATEGORY_LABELS.play, emoji: EVENT_CATEGORY_EMOJI.play },
  { value: 'health', label: EVENT_CATEGORY_LABELS.health, emoji: EVENT_CATEGORY_EMOJI.health },
  { value: 'travel', label: EVENT_CATEGORY_LABELS.travel, emoji: EVENT_CATEGORY_EMOJI.travel },
  { value: 'sports', label: EVENT_CATEGORY_LABELS.sports, emoji: EVENT_CATEGORY_EMOJI.sports },
  { value: 'barca', label: EVENT_CATEGORY_LABELS.barca, emoji: EVENT_CATEGORY_EMOJI.barca },
  { value: 'procedure', label: EVENT_CATEGORY_LABELS.procedure, emoji: EVENT_CATEGORY_EMOJI.procedure },
  { value: 'birthday', label: EVENT_CATEGORY_LABELS.birthday, emoji: EVENT_CATEGORY_EMOJI.birthday },
  { value: 'anniversary', label: EVENT_CATEGORY_LABELS.anniversary, emoji: EVENT_CATEGORY_EMOJI.anniversary },
]
