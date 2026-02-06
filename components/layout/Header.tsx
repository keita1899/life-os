'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeSwitch } from '@/components/mode/ModeSwitch'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-stone-800">
      <div className="container mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-8 lg:px-16">
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
          <Link
            href="/"
            className="text-xl font-semibold hover:opacity-80 transition-opacity"
          >
            Life OS
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ModeSwitch />
        </div>
      </div>
    </header>
  )
}
