'use client'

import { usePathname } from 'next/navigation'
import {
  HOME_ITEM,
  TASK_ITEMS,
  FINANCE_ITEMS,
  LIST_ITEMS,
  SETTINGS_ITEM,
  getActiveHref,
} from './sidebar-items'
import { SidebarItem } from './SidebarItem'

const LIFE_HREFS = [
  HOME_ITEM.href,
  ...TASK_ITEMS.map((i) => i.href),
  ...FINANCE_ITEMS.map((i) => i.href),
  ...LIST_ITEMS.map((i) => i.href),
  SETTINGS_ITEM.href,
]

interface LifeSidebarContentProps {
  isCollapsed: boolean
}

export function LifeSidebarContent({ isCollapsed }: LifeSidebarContentProps) {
  const pathname = usePathname()
  const activeHref = getActiveHref(pathname ?? '', LIFE_HREFS)

  return (
    <nav className="flex flex-col">
      <SidebarItem
        item={HOME_ITEM}
        isCollapsed={isCollapsed}
        isActive={activeHref === HOME_ITEM.href}
      />
      <div className="mt-2">
        {TASK_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activeHref === item.href}
          />
        ))}
      </div>
      <div className="mt-2">
        {FINANCE_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={activeHref === item.href}
          />
        ))}
      </div>
      <div className="mt-2">
        {LIST_ITEMS.map((item) => (
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
