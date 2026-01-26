'use client'

import { useEffect } from 'react'
import { useMode } from '@/lib/contexts/ModeContext'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const LAST_PATH_LIFE_KEY = 'life-os-last-path-life'
const LAST_PATH_DEV_KEY = 'life-os-last-path-development'

function isValidPathForMode(mode: 'life' | 'development', pathname: string): boolean {
  if (!pathname) return false
  // Extract pathname without query string for validation
  const pathOnly = pathname.split('?')[0]
  if (mode === 'life') return !pathOnly.startsWith('/dev')
  return pathOnly === '/' || pathOnly.startsWith('/dev')
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

export function ModeSwitch() {
  const { mode, setMode } = useMode()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    if (!isValidPathForMode(mode, pathname)) return
    // Include query parameters in the saved path
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname
    safeSetLocalStorage(getLastPathKey(mode), fullPath)
  }, [mode, pathname, searchParams])

  const handleModeChange = (newMode: 'life' | 'development') => {
    if (newMode === mode) return

    setMode(newMode)

    const lastPath = safeGetLocalStorage(getLastPathKey(newMode), '/')
    router.push(isValidPathForMode(newMode, lastPath) ? lastPath : '/')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      if (isInputFocused) {
        return
      }

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        if (mode !== 'life') {
          setMode('life')
          const lastPath = safeGetLocalStorage(LAST_PATH_LIFE_KEY, '/')
          router.push(isValidPathForMode('life', lastPath) ? lastPath : '/')
        }
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        if (mode !== 'development') {
          setMode('development')
          const lastPath = safeGetLocalStorage(LAST_PATH_DEV_KEY, '/')
          router.push(isValidPathForMode('development', lastPath) ? lastPath : '/')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mode, router, setMode])

  return (
    <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleModeChange('life')}
        className={cn(
          'flex-1 transition-all',
          mode === 'life'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-accent',
        )}
      >
        <span className="flex items-center justify-between w-full">
          <span>ライフモード</span>
          <span className="ml-2 text-xs opacity-60">L</span>
        </span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleModeChange('development')}
        className={cn(
          'flex-1 transition-all',
          mode === 'development'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-accent',
        )}
      >
        <span className="flex items-center justify-between w-full">
          <span>開発モード</span>
          <span className="ml-2 text-xs opacity-60">D</span>
        </span>
      </Button>
    </div>
  )
}
