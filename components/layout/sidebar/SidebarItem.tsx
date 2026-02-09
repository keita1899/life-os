'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SidebarItemData } from './sidebar-items'

interface SidebarItemProps {
  item: SidebarItemData
  isCollapsed: boolean
  isActive: boolean
}

export function SidebarItem({ item, isCollapsed, isActive }: SidebarItemProps) {
  const Icon = item.icon

  return (
    <div className="relative group">
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg p-2 h-10 transition-colors whitespace-nowrap',
          isCollapsed && 'w-10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !isActive && 'text-muted-foreground',
          !isActive && item.hoverIcon,
          isActive && item.activeIcon,
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span className="font-semibold">{item.title}</span>}
      </Link>
      {isCollapsed && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 overflow-hidden rounded-md border border-stone-200/50 dark:border-stone-700/50 bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md whitespace-nowrap pointer-events-none">
          {item.title}
        </div>
      )}
    </div>
  )
}
