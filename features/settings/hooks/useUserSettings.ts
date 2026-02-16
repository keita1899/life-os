import useSWR from 'swr'
import { mutate } from 'swr'
import { getUserSettings, updateUserSettings } from '../lib'
import type { UserSettings, UpdateUserSettingsInput } from '../types/user-settings'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useUserSettings() {
  const {
    data,
    error,
    isLoading,
  } = useSWR<UserSettings>(SWR_KEYS.userSettings, () =>
    fetcher(() => getUserSettings()),
  )

  const handleUpdateUserSettings = async (input: UpdateUserSettingsInput) => {
    const result = await updateUserSettings(input)
    await mutate(SWR_KEYS.userSettings)
    return result
  }

  return {
    userSettings: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch user settings'
      : null,
    updateUserSettings: handleUpdateUserSettings,
  }
}
