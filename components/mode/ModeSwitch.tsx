'use client'

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
