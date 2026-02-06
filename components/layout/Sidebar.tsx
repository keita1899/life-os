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
  PanelLeft,
  FolderKanban,
  Eye,
  Wallet,
  Repeat,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

const financeItems = [
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
]

const listItems = [
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

const settingsItem = {
  href: '/settings',
  icon: Settings,
  title: '設定',
  hoverIcon:
    'group-hover:bg-stone-200 group-hover:text-stone-800 dark:group-hover:bg-stone-700 dark:group-hover:text-stone-200',
  activeIcon:
    'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
}

function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
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

    const link = (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-lg p-2 h-10 transition-colors whitespace-nowrap',
          isCollapsed && 'w-10',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive && 'bg-accent text-accent-foreground',
          !isActive && 'text-stone-600 dark:text-stone-400',
          item.hoverIcon,
          isActive && item.activeIcon,
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span className="font-semibold">{item.title}</span>}
      </Link>
    )

    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>
          <div>{link}</div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
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
      <nav className="flex flex-col">
        {renderLink(homeItem)}
        <div className="mt-2">
          {devTaskItems.map((item) => renderLink(item))}
        </div>
        <div className="mt-2">
          {renderLink(settingsItem)}
        </div>
      </nav>
    )
  }

  return (
    <nav className="flex flex-col">
      {renderLink(homeItem)}
      <div className="mt-2">
        {taskItems.map((item) => renderLink(item))}
      </div>
      <div className="mt-2">
        {financeItems.map((item) => renderLink(item))}
      </div>
      <div className="mt-2">
        {listItems.map((item) => renderLink(item))}
      </div>
      <div className="mt-2">
        {renderLink(settingsItem)}
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
    <TooltipProvider>
      <>
        <aside
          suppressHydrationWarning
          className={cn(
            'hidden md:flex md:flex-shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-muted/40 dark:md:border-stone-800',
            'md:transition-[width] md:duration-300 md:ease-in-out md:overflow-hidden',
            'md:sticky md:top-0 md:h-screen',
            open ? 'md:w-72' : 'md:w-16',
          )}
        >
          <div className="w-72 h-full flex flex-col">
            <div className="h-14 flex items-center px-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onOpenChange(!open)}
                    className="group flex items-center justify-center rounded-lg p-2 h-10 w-10 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-stone-600 dark:text-stone-400"
                  >
                    <PanelLeft className="h-5 w-5 flex-shrink-0" />
                    <span className="sr-only">
                      {open ? 'サイドバーを閉じる' : 'サイドバーを開く'}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{open ? 'サイドバーを閉じる' : 'サイドバーを開く'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-2">
              <SidebarContent isCollapsed={!open} />
            </div>
          </div>
        </aside>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="h-14">
                <SheetTitle></SheetTitle>
              </SheetHeader>
              <div className="p-2">
                <SidebarContent isCollapsed={false} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    </TooltipProvider>
  )
}
