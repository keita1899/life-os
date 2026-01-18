'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SettingsIconProps {
  className?: string
}

export function SettingsIcon({ className }: SettingsIconProps) {
  return (
    <Link href="/settings">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 text-muted-foreground hover:text-foreground',
          className,
        )}
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">設定</span>
      </Button>
    </Link>
  )
}
