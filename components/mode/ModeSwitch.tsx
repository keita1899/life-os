'use client'

import { useEffect } from 'react'
import { useMode } from '@/lib/contexts/ModeContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function ModeSwitch() {
  const { mode, setMode } = useMode()
  const router = useRouter()

  const handleModeChange = (newMode: 'life' | 'development') => {
    if (newMode === mode) return

    router.push('/')
    setMode(newMode)
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
          router.push('/')
          setMode('life')
        }
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        if (mode !== 'development') {
          router.push('/')
          setMode('development')
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
