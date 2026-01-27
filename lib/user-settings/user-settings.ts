import { getDatabase, handleDbError } from '../db'
import type {
  UserSettings,
  UpdateUserSettingsInput,
} from '../types/user-settings'

interface DbUserSettings {
  id: number
  birthday: string | null
  default_calendar_view: string
  week_start_day: number
  morning_review_time: string | null
  evening_review_time: string | null
  barcelona_ical_url: string | null
  created_at: string
  updated_at: string
}

function mapDbUserSettingsToUserSettings(
  dbSettings: DbUserSettings,
): UserSettings {
  const validatedDefaultCalendarView: 'month' | 'week' =
    dbSettings.default_calendar_view === 'month' ||
    dbSettings.default_calendar_view === 'week'
      ? dbSettings.default_calendar_view
      : 'month'

  return {
    id: dbSettings.id,
    birthday: dbSettings.birthday,
    defaultCalendarView: validatedDefaultCalendarView,
    weekStartDay: dbSettings.week_start_day,
    morningReviewTime: dbSettings.morning_review_time,
    eveningReviewTime: dbSettings.evening_review_time,
    barcelonaIcalUrl: dbSettings.barcelona_ical_url ?? null,
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
        `INSERT INTO user_settings (default_calendar_view, week_start_day)
         VALUES (?, ?)`,
        ['month', 0],
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
  } catch (err) {
    currentSettings = await getUserSettings()
  }

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.birthday !== undefined) {
    updateFields.push('birthday = ?')
    updateValues.push(input.birthday || null)
  }

  if (input.defaultCalendarView !== undefined) {
    updateFields.push('default_calendar_view = ?')
    updateValues.push(input.defaultCalendarView)
  }

  if (input.weekStartDay !== undefined) {
    updateFields.push('week_start_day = ?')
    updateValues.push(input.weekStartDay)
  }

  if (input.morningReviewTime !== undefined) {
    updateFields.push('morning_review_time = ?')
    updateValues.push(input.morningReviewTime || null)
  }

  if (input.eveningReviewTime !== undefined) {
    updateFields.push('evening_review_time = ?')
    updateValues.push(input.eveningReviewTime || null)
  }

  if (input.barcelonaIcalUrl !== undefined) {
    updateFields.push('barcelona_ical_url = ?')
    updateValues.push(input.barcelonaIcalUrl || null)
  }

  if (updateFields.length === 0) {
    return currentSettings
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(currentSettings.id)

  try {
    await db.execute(
      `UPDATE user_settings SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
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
    throw err
  }
}

export async function getBirthdate(): Promise<string | null> {
  const settings = await getUserSettings()
  return settings.birthday
}

export async function setBirthdate(birthday: string | null): Promise<void> {
  await updateUserSettings({ birthday })
}
