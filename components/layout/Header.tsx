'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeSwitch } from '@/components/mode/ModeSwitch'
import { SettingsIcon } from '@/components/settings/SettingsIcon'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-stone-800">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニューを開く</span>
          </Button>
          <h1 className="text-xl font-semibold">Life OS</h1>
        </div>
        <div className="flex items-center gap-2">
          <SettingsIcon />
          <ModeSwitch />
        </div>
      </div>
    </header>
  )
}
