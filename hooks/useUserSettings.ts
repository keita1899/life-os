import useSWR from 'swr'
import { mutate } from 'swr'
import { getUserSettings, updateUserSettings, getBirthdate, setBirthdate } from '@/lib/user-settings'
import type { UserSettings, UpdateUserSettingsInput } from '@/lib/types/user-settings'
import { fetcher } from '@/lib/swr'

const userSettingsKey = 'user-settings'

export function useUserSettings() {
  const {
    data,
    error,
    isLoading,
  } = useSWR<UserSettings>(userSettingsKey, () => fetcher(() => getUserSettings()))

  const handleUpdateUserSettings = async (input: UpdateUserSettingsInput) => {
    await updateUserSettings(input)
    await mutate(userSettingsKey)
  }

  const handleGetBirthdate = async (): Promise<string | null> => {
    return await getBirthdate()
  }

  const handleSetBirthdate = async (birthday: string | null) => {
    await setBirthdate(birthday)
    await mutate(userSettingsKey)
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
    getBirthdate: handleGetBirthdate,
    setBirthdate: handleSetBirthdate,
    refreshUserSettings: () => mutate(userSettingsKey),
  }
}
