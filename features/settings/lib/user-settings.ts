import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import type {
  UserSettings,
  UpdateUserSettingsInput,
  WeekdayThemes,
} from '../types/user-settings'

interface DbUserSettings {
  id: number
  birthday: string | null
  default_calendar_view: string
  week_start_day: number
  morning_review_time: string | null
  evening_review_time: string | null
  week_start_review_time: string | null
  week_end_review_time: string | null
  barcelona_ical_url: string | null
  initial_balance: number | null
  default_habit_view: string
  notify_events: number
  notify_tasks: number
  notify_habits: number
  notify_minutes_before: number
  life_weekday_themes: string
  dev_weekday_themes: string
  created_at: string
  updated_at: string
}

function parseWeekdayThemes(json: string | null | undefined): WeekdayThemes {
  if (!json) return {}
  try {
    return JSON.parse(json) as WeekdayThemes
  } catch {
    return {}
  }
}

function mapDbUserSettingsToUserSettings(
  dbSettings: DbUserSettings,
): UserSettings {
  const validatedDefaultCalendarView: 'month' | 'week' =
    dbSettings.default_calendar_view === 'month' ||
    dbSettings.default_calendar_view === 'week'
      ? dbSettings.default_calendar_view
      : 'week'

  const validatedDefaultHabitView: 'month' | 'week' =
    dbSettings.default_habit_view === 'month' ||
    dbSettings.default_habit_view === 'week'
      ? dbSettings.default_habit_view
      : 'week'

  return {
    id: dbSettings.id,
    birthday: dbSettings.birthday,
    defaultCalendarView: validatedDefaultCalendarView,
    weekStartDay: dbSettings.week_start_day,
    morningReviewTime: dbSettings.morning_review_time,
    eveningReviewTime: dbSettings.evening_review_time,
    weekStartReviewTime: dbSettings.week_start_review_time ?? null,
    weekEndReviewTime: dbSettings.week_end_review_time ?? null,
    barcelonaIcalUrl: dbSettings.barcelona_ical_url ?? null,
    initialBalance: dbSettings.initial_balance ?? null,
    defaultHabitView: validatedDefaultHabitView,
    notifyEvents: dbSettings.notify_events === 1,
    notifyTasks: dbSettings.notify_tasks === 1,
    notifyHabits: dbSettings.notify_habits === 1,
    notifyMinutesBefore: dbSettings.notify_minutes_before,
    lifeWeekdayThemes: parseWeekdayThemes(dbSettings.life_weekday_themes),
    devWeekdayThemes: parseWeekdayThemes(dbSettings.dev_weekday_themes),
    createdAt: dbSettings.created_at,
    updatedAt: dbSettings.updated_at,
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbUserSettings[]>(
      'SELECT * FROM user_settings LIMIT 1',
    )

    if (result.length === 0) {
      await db.execute(
        `INSERT INTO user_settings (default_calendar_view, week_start_day, default_habit_view)
         VALUES (?, ?, ?)`,
        ['week', 1, 'week'],
      )

      const newResult = await db.select<DbUserSettings[]>(
        'SELECT * FROM user_settings LIMIT 1',
      )

      if (newResult.length === 0) {
        throw new Error('Failed to create default user settings')
      }

      return mapDbUserSettingsToUserSettings(newResult[0])
    }

    return mapDbUserSettingsToUserSettings(result[0])
  } catch (err) {
    handleDbError(err, 'get user settings')
  }
}

const USER_SETTINGS_UPDATE_MAPPING: FieldMapping<UpdateUserSettingsInput> = [
  { key: 'birthday', column: 'birthday', transform: (v) => v || null },
  { key: 'defaultCalendarView', column: 'default_calendar_view' },
  { key: 'weekStartDay', column: 'week_start_day' },
  { key: 'morningReviewTime', column: 'morning_review_time', transform: (v) => v || null },
  { key: 'eveningReviewTime', column: 'evening_review_time', transform: (v) => v || null },
  { key: 'weekStartReviewTime', column: 'week_start_review_time', transform: (v) => v || null },
  { key: 'weekEndReviewTime', column: 'week_end_review_time', transform: (v) => v || null },
  { key: 'barcelonaIcalUrl', column: 'barcelona_ical_url', transform: (v) => v || null },
  { key: 'initialBalance', column: 'initial_balance', transform: (v) => v ?? null },
  { key: 'defaultHabitView', column: 'default_habit_view' },
  { key: 'notifyEvents', column: 'notify_events', transform: (v) => (v ? 1 : 0) },
  { key: 'notifyTasks', column: 'notify_tasks', transform: (v) => (v ? 1 : 0) },
  { key: 'notifyHabits', column: 'notify_habits', transform: (v) => (v ? 1 : 0) },
  { key: 'notifyMinutesBefore', column: 'notify_minutes_before' },
  { key: 'lifeWeekdayThemes', column: 'life_weekday_themes', transform: (v) => JSON.stringify(v ?? {}) },
  { key: 'devWeekdayThemes', column: 'dev_weekday_themes', transform: (v) => JSON.stringify(v ?? {}) },
]

export async function updateUserSettings(
  input: UpdateUserSettingsInput,
): Promise<UserSettings> {
  const db = await getDatabase()

  let currentSettings: UserSettings
  try {
    const result = await db.select<DbUserSettings[]>(
      'SELECT * FROM user_settings LIMIT 1',
    )
    if (result.length === 0) {
      currentSettings = await getUserSettings()
    } else {
      currentSettings = mapDbUserSettingsToUserSettings(result[0])
    }
  } catch {
    currentSettings = await getUserSettings()
  }

  const params = buildUpdateParams(input, USER_SETTINGS_UPDATE_MAPPING)

  if (params === null) {
    return currentSettings
  }

  params.values.push(currentSettings.id)

  try {
    await db.execute(
      `UPDATE user_settings SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbUserSettings[]>(
      'SELECT * FROM user_settings LIMIT 1',
    )

    if (result.length === 0) {
      throw new Error('Failed to update user settings: record not found after update')
    }

    return mapDbUserSettingsToUserSettings(result[0])
  } catch (err) {
    handleDbError(err, 'update user settings')
  }
}
