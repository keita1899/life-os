'use client'

import { usePathname } from 'next/navigation'
import {
  HOME_ITEM,
  DEV_TASK_ITEMS,
  SETTINGS_ITEM,
  getActiveHref,
} from './sidebar-items'
import { SidebarItem } from './SidebarItem'

const DEV_HOME_ITEM = { ...HOME_ITEM, href: '/dev' }

const DEV_HREFS = [
  DEV_HOME_ITEM.href,
  ...DEV_TASK_ITEMS.map((i) => i.href),
  SETTINGS_ITEM.href,
]

interface DevSidebarContentProps {
  isCollapsed: boolean
}

export function DevSidebarContent({ isCollapsed }: DevSidebarContentProps) {
  const pathname = usePathname()
  const activeHref = getActiveHref(pathname ?? '', DEV_HREFS)
  const path = pathname?.split('?')[0] ?? ''
  const isLogsPage = path === '/dev/logs'

  return (
    <nav className="flex flex-col">
      <SidebarItem
        item={DEV_HOME_ITEM}
        isCollapsed={isCollapsed}
        isActive={activeHref === DEV_HOME_ITEM.href || isLogsPage}
      />
      <div className="mt-2">
        {DEV_TASK_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activeHref === item.href}
          />
        ))}
      </div>
      <div className="mt-2">
        <SidebarItem
          item={SETTINGS_ITEM}
          isCollapsed={isCollapsed}
          isActive={activeHref === SETTINGS_ITEM.href}
        />
      </div>
    </nav>
  )
}
