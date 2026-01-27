'use client'

import { useEffect, useRef, useCallback } from 'react'
import { mutate } from 'swr'
import { syncBarcelonaMatches } from '@/lib/football/barcelona'

const STORAGE_KEY = 'barcelona-sync-last-time'
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000

function getLastSyncTime(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? parseInt(stored, 10) : 0
}

function setLastSyncTime(time: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(time))
}

function shouldSync(): boolean {
  const lastSync = getLastSyncTime()
  const now = Date.now()
  return now - lastSync >= SYNC_INTERVAL_MS
}

export function useBarcelonaMatches(barcelonaIcalUrl: string | null) {
  const syncingRef = useRef(false)

  const performSync = useCallback(async () => {
    if (!barcelonaIcalUrl || syncingRef.current) return

    syncingRef.current = true
    try {
      await syncBarcelonaMatches(barcelonaIcalUrl)
      setLastSyncTime(Date.now())
      await mutate('events')
    } catch (error) {
      console.error('Failed to sync Barcelona matches:', error)
    } finally {
      syncingRef.current = false
    }
  }, [barcelonaIcalUrl])

  useEffect(() => {
    if (!barcelonaIcalUrl) return
    if (!shouldSync()) return

    performSync()
  }, [barcelonaIcalUrl, performSync])

  return { sync: performSync }
}
