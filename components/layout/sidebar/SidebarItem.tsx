'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import type { SidebarItemData } from './sidebar-items'

interface SidebarItemProps {
  item: SidebarItemData
  isCollapsed: boolean
  isActive: boolean
}

export function SidebarItem({ item, isCollapsed, isActive }: SidebarItemProps) {
  const Icon = item.icon

  return (
    <Tooltip open={isCollapsed ? undefined : false}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'group flex items-center gap-3 rounded-lg p-2 h-10 transition-colors whitespace-nowrap',
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
      </TooltipTrigger>
      <TooltipContent side="right">
        {item.title}
      </TooltipContent>
    </Tooltip>
  )
}
