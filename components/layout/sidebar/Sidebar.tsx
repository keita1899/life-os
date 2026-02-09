'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SidebarContent } from './SidebarContent'

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
            <div className="relative group">
              <button
                onClick={() => onOpenChange(!open)}
                className="flex items-center justify-center rounded-lg p-2 h-10 w-10 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-stone-600 dark:text-stone-400"
              >
                <PanelLeft className="h-5 w-5 flex-shrink-0" />
                <span className="sr-only">
                  {open ? 'サイドバーを閉じる' : 'サイドバーを開く'}
                </span>
              </button>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 overflow-hidden rounded-md border border-stone-200/50 dark:border-stone-700/50 bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md whitespace-nowrap pointer-events-none">
                {open ? 'サイドバーを閉じる' : 'サイドバーを開く'}
              </div>
            </div>
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
  )
}
