'use client'

import { useAppMode } from '@/hooks/useAppMode'
import { LifeSidebarContent } from './LifeSidebarContent'
import { DevSidebarContent } from './DevSidebarContent'

interface SidebarContentProps {
  isCollapsed: boolean
}

export function SidebarContent({ isCollapsed }: SidebarContentProps) {
  const { isDevMode } = useAppMode()

  if (isDevMode) {
    return <DevSidebarContent key="dev" isCollapsed={isCollapsed} />
  }

  return <LifeSidebarContent key="life" isCollapsed={isCollapsed} />
}
