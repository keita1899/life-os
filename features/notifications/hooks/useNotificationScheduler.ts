'use client'

import { useEffect, useRef } from 'react'
import { useUserSettings } from '@/features/settings'
import {
  collectPendingNotifications,
  markAsSent,
  formatNotificationBody,
} from '../lib/notification-scheduler'

const POLL_INTERVAL_MS = 60 * 1000 // 1 minute

async function sendNativeNotification(title: string, body: string): Promise<void> {
  try {
    const {
      isPermissionGranted,
      requestPermission,
      sendNotification,
    } = await import('@tauri-apps/plugin-notification')

    let hasPermission = await isPermissionGranted()
    if (!hasPermission) {
      const result = await requestPermission()
      hasPermission = result === 'granted'
    }

    if (hasPermission) {
      sendNotification({ title, body })
    }
  } catch {
    // Not running in Tauri environment — silently ignore
  }
}

export function useNotificationScheduler(): void {
  const { userSettings } = useUserSettings()
  const settingsRef = useRef(userSettings)

  useEffect(() => {
    settingsRef.current = userSettings
  }, [userSettings])

  useEffect(() => {
    const anyEnabled =
      userSettings?.notifyEvents ||
      userSettings?.notifyTasks ||
      userSettings?.notifyHabits

    if (!anyEnabled) return

    let isRunning = false

    const tick = async () => {
      if (isRunning) return
      isRunning = true
      try {
        const settings = settingsRef.current
        if (!settings) return

        const items = await collectPendingNotifications(settings)

        for (const item of items) {
          await sendNativeNotification(item.title, formatNotificationBody(item))
          markAsSent(item.id)
        }
      } catch (err) {
        console.warn('[notifications] 通知処理に失敗しました:', err)
      } finally {
        isRunning = false
      }
    }

    // Run immediately on mount
    void tick()

    const intervalId = setInterval(() => void tick(), POLL_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [
    userSettings?.notifyEvents,
    userSettings?.notifyTasks,
    userSettings?.notifyHabits,
    userSettings?.notifyMinutesBefore,
  ])
}
