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
