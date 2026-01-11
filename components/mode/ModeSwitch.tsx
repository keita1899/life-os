'use client'

import { useEffect } from 'react'
import { useMode, setLastPath, getLastPath } from '@/lib/contexts/ModeContext'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function ModeSwitch() {
  const { mode, setMode } = useMode()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      setLastPath(pathname)
    }
  }, [pathname])

  const handleModeChange = (newMode: 'life' | 'development') => {
    if (newMode === mode) return

    if (newMode === 'development' && pathname === '/goals') {
      setLastPath('/goals')
      router.push('/')
    } else if (newMode === 'life') {
      const lastPath = getLastPath()
      if (lastPath === '/goals' && pathname !== '/goals') {
        router.push('/goals')
      }
    }

    setMode(newMode)
  }

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
        ライフモード
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
        開発モード
      </Button>
    </div>
  )
}
