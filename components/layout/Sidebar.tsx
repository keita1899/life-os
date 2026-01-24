'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Target,
  CheckSquare,
  Calendar,
  Heart,
  CreditCard,
  Menu,
  ChevronLeft,
  FolderKanban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMode } from '@/lib/contexts/ModeContext'

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const homeItem = {
  href: '/',
  icon: Home,
  title: 'ホーム',
  color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
}

const taskItems = [
  {
    href: '/goals',
    icon: Target,
    title: '目標',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    href: '/events',
    icon: Calendar,
    title: '予定',
    color:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/tasks',
    icon: CheckSquare,
    title: 'タスク',
    color:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
]

const otherItems = [
  {
    href: '/subscriptions',
    icon: CreditCard,
    title: 'サブスク',
    color:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    href: '/bucket-list',
    icon: Heart,
    title: 'やりたいことリスト',
    color:
      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    href: '/wishlist',
    icon: Heart,
    title: '欲しいものリスト',
    color:
      'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  },
]

function SidebarContent() {
  const pathname = usePathname()
  const { mode } = useMode()

  const renderLink = (item: typeof homeItem) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg border border-stone-200 bg-card p-3 transition-colors dark:border-stone-800',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive && 'bg-accent text-accent-foreground',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md',
            item.color,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-semibold">{item.title}</div>
      </Link>
    )
  }

  if (mode === 'development') {
    const devTaskItems = [
      {
        href: '/dev/goals',
        icon: Target,
        title: '目標',
        color:
          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      },
      {
        href: '/dev/projects',
        icon: FolderKanban,
        title: 'プロジェクト',
        color:
          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      },
    ]

    return (
      <nav className="space-y-4">
        <div>
          {renderLink(homeItem)}
        </div>
        <div className="space-y-2">
          {devTaskItems.map((item) => renderLink(item))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="space-y-4">
      <div>
        {renderLink(homeItem)}
      </div>
      <div className="space-y-2">
        {taskItems.map((item) => renderLink(item))}
      </div>
      <div className="space-y-2">
        {otherItems.map((item) => renderLink(item))}
      </div>
    </nav>
  )
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && open) {
      onOpenChange(false)
    }
    prevPathnameRef.current = pathname
  }, [pathname, open, onOpenChange])

  return (
    <>
      {open ? (
        <aside className="hidden md:flex md:w-72 md:flex-shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-muted/40 md:transition-all md:duration-300 md:ease-in-out md:overflow-y-auto dark:md:border-stone-800">
          <div className="p-4 w-full">
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">サイドバーを閉じる</span>
              </Button>
            </div>
            <SidebarContent />
          </div>
        </aside>
      ) : (
        <div className="hidden md:flex md:flex-shrink-0 md:flex-col md:items-start md:border-r md:border-stone-200 dark:md:border-stone-800">
          <div className="sticky top-14 pt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(true)}
              className="h-10 w-10"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">サイドバーを開く</span>
            </Button>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-stone-200 p-4 dark:border-stone-800">
              <SheetTitle>メニュー</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
