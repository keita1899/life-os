'use client'

import { useEffect, Suspense } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useAppMode } from '@/hooks/useAppMode'
import { useFocusSessionActive } from '@/hooks/useFocusSessionActive'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const LAST_PATH_LIFE_KEY = 'life-os-last-path-life'
const LAST_PATH_DEV_KEY = 'life-os-last-path-development'
const LAST_NONFOCUS_PATH_LIFE_KEY = 'life-os-last-nonfocus-path-life'
const LAST_NONFOCUS_PATH_DEV_KEY = 'life-os-last-nonfocus-path-development'

function isValidPathForMode(mode: 'life' | 'development', pathname: string): boolean {
  if (!pathname) return false
  const pathOnly = pathname.split('?')[0]
  if (mode === 'life') return !pathOnly.startsWith('/dev')
  return pathOnly.startsWith('/dev')
}

function isFocusPath(pathname: string | null): boolean {
  if (!pathname) return false
  const pathOnly = pathname.split('?')[0]
  return pathOnly === '/focus' || pathOnly === '/dev/focus'
}

function getLastPathKey(mode: 'life' | 'development'): string {
  return mode === 'life' ? LAST_PATH_LIFE_KEY : LAST_PATH_DEV_KEY
}

function safeGetLocalStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage access failed, ignore safely
  }
}

function ModeSwitchContent() {
  const { mode } = useAppMode()
  const { isActive: isFocusSessionActive } = useFocusSessionActive()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    if (!isValidPathForMode(mode, pathname)) return
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname
    // モード切替用: すべてのページを保存
    safeSetLocalStorage(getLastPathKey(mode), fullPath)
    // フォーカスの戻る用: 非フォーカスページのみ保存
    if (!isFocusPath(pathname)) {
      const nonfocusKey = mode === 'life' ? LAST_NONFOCUS_PATH_LIFE_KEY : LAST_NONFOCUS_PATH_DEV_KEY
      safeSetLocalStorage(nonfocusKey, fullPath)
    }
  }, [mode, pathname, searchParams])

  const handleModeChange = (newMode: 'life' | 'development') => {
    if (newMode === mode) return

    const defaultPath = newMode === 'life' ? '/' : '/dev'
    const lastPath = safeGetLocalStorage(getLastPathKey(newMode), defaultPath)
    router.push(isValidPathForMode(newMode, lastPath) ? lastPath : defaultPath)
  }

  useHotkeys(
    'mod+l',
    () => {
      if (mode !== 'life') {
        const lastPath = safeGetLocalStorage(LAST_PATH_LIFE_KEY, '/')
        router.push(isValidPathForMode('life', lastPath) ? lastPath : '/')
      }
    },
    { enableOnFormTags: false, preventDefault: true, enabled: !isFocusSessionActive },
    [mode, router, isFocusSessionActive],
  )
  useHotkeys(
    'mod+d',
    () => {
      if (mode !== 'development') {
        const lastPath = safeGetLocalStorage(LAST_PATH_DEV_KEY, '/dev')
        router.push(
          isValidPathForMode('development', lastPath) ? lastPath : '/dev',
        )
      }
    },
    { enableOnFormTags: false, preventDefault: true, enabled: !isFocusSessionActive },
    [mode, router, isFocusSessionActive],
  )

  return (
    <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleModeChange('life')}
        className={cn(
          'flex-1 transition-all',
          mode === 'life'
            ? 'bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90'
            : 'bg-black text-white hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90',
        )}
      >
        Life
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleModeChange('development')}
        className={cn(
          'flex-1 transition-all',
          mode === 'development'
            ? 'bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90'
            : 'bg-slate-800 text-slate-100 hover:bg-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        )}
      >
        Dev
      </Button>
    </div>
  )
}

export function ModeSwitch() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-1">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      </div>
    }>
      <ModeSwitchContent />
    </Suspense>
  )
}
