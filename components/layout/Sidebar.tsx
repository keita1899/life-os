'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Target,
  CheckSquare,
  Calendar,
  ListChecks,
  ShoppingBag,
  CreditCard,
  Menu,
  ChevronLeft,
  FolderKanban,
  Eye,
  Wallet,
  Repeat,
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
  hoverIcon:
    'group-hover:bg-stone-200 group-hover:text-stone-800 dark:group-hover:bg-stone-700 dark:group-hover:text-stone-200',
  activeIcon:
    'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
}

const taskItems = [
  {
    href: '/goals',
    icon: Target,
    title: '目標',
    hoverIcon:
      'group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400',
    activeIcon:
      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    href: '/events',
    icon: Calendar,
    title: '予定',
    hoverIcon:
      'group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-900/30 dark:group-hover:text-purple-400',
    activeIcon:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/tasks',
    icon: CheckSquare,
    title: 'タスク',
    hoverIcon:
      'group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400',
    activeIcon:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    href: '/habits',
    icon: Repeat,
    title: '習慣',
    hoverIcon:
      'group-hover:bg-teal-100 group-hover:text-teal-600 dark:group-hover:bg-teal-900/30 dark:group-hover:text-teal-400',
    activeIcon:
      'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  },
]

const otherItems = [
  {
    href: '/kakeibo',
    icon: Wallet,
    title: '家計簿',
    hoverIcon:
      'group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400',
    activeIcon:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    href: '/subscriptions',
    icon: CreditCard,
    title: 'サブスク',
    hoverIcon:
      'group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400',
    activeIcon:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    href: '/bucket-list',
    icon: ListChecks,
    title: 'やりたいことリスト',
    hoverIcon:
      'group-hover:bg-orange-100 group-hover:text-orange-600 dark:group-hover:bg-orange-900/30 dark:group-hover:text-orange-400',
    activeIcon:
      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    href: '/wishlist',
    icon: ShoppingBag,
    title: '欲しいものリスト',
    hoverIcon:
      'group-hover:bg-pink-100 group-hover:text-pink-600 dark:group-hover:bg-pink-900/30 dark:group-hover:text-pink-400',
    activeIcon:
      'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  },
  {
    href: '/vision',
    icon: Eye,
    title: 'ビジョン',
    hoverIcon:
      'group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400',
    activeIcon:
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
]

function SidebarContent() {
  const pathname = usePathname()
  const { mode } = useMode()

  const renderLink = (
    item: typeof homeItem & {
      hoverIcon?: string
      activeIcon?: string
    },
  ) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-lg border border-stone-200 bg-card p-3 transition-colors dark:border-stone-800',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive && 'bg-accent text-accent-foreground',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
            'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
            item.hoverIcon,
            isActive && item.activeIcon,
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
        hoverIcon:
          'group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400',
        activeIcon:
          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      },
      {
        href: '/dev/projects',
        icon: FolderKanban,
        title: 'プロジェクト',
        hoverIcon:
          'group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-900/30 dark:group-hover:text-purple-400',
        activeIcon:
          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      },
      {
        href: '/dev/tasks',
        icon: CheckSquare,
        title: 'タスク',
        hoverIcon:
          'group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400',
        activeIcon:
          'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
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
        <aside suppressHydrationWarning className="hidden md:flex md:w-72 md:flex-shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-muted/40 md:transition-all md:duration-300 md:ease-in-out md:overflow-y-auto dark:md:border-stone-800">
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
        <div suppressHydrationWarning className="hidden md:flex md:flex-shrink-0 md:flex-col md:items-start md:border-r md:border-stone-200 dark:md:border-stone-800">
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
