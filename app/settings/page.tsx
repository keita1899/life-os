'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { UserSettingsForm } from '@/components/settings/UserSettingsForm'
import { useUserSettings } from '@/hooks/useUserSettings'
import type { UpdateUserSettingsInput } from '@/lib/types/user-settings'

export default function SettingsPage() {
  const {
    userSettings,
    isLoading,
    error,
    updateUserSettings,
  } = useUserSettings()
  const [operationError, setOperationError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSubmit = async (input: UpdateUserSettingsInput) => {
    try {
      setOperationError(null)
      setSaveSuccess(false)
      setIsSaving(true)
      await updateUserSettings(input)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '設定の保存に失敗しました',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
        <h1 className="text-3xl font-bold">設定</h1>
      </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {saveSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 dark:bg-green-950/50 dark:border-green-800 dark:text-green-200">
          設定を保存しました
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>ユーザー設定</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSettingsForm
              onSubmit={handleSubmit}
              initialData={userSettings}
              isSubmitting={isSaving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
