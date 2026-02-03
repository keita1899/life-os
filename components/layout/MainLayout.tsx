'use client'

import { useCallback, useEffect, useState } from 'react'
import { useMode } from '@/lib/contexts/ModeContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

const SIDEBAR_STORAGE_KEY = 'sidebar-open'

function getInitialSidebarState(): boolean {
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (saved !== null) {
      return saved === 'true'
    }
  } catch {
    // localStorage access failed, use default
  }
  return false
}

export function MainLayout({ children }: MainLayoutProps) {
  const { mode } = useMode()
  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState)

  const handleOpenChange = useCallback((open: boolean): void => {
    setIsSidebarOpen(open)
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open))
    } catch {
      // localStorage access failed, ignore safely
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      if (isInputFocused) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        handleOpenChange(!isSidebarOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleOpenChange, isSidebarOpen])

  const handleMenuClick = useCallback((): void => {
    handleOpenChange(!isSidebarOpen)
  }, [handleOpenChange, isSidebarOpen])

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex flex-1">
        <Sidebar open={isSidebarOpen} onOpenChange={handleOpenChange} />
        <main
          className={cn(
            'flex-1',
            mode === 'development' && 'bg-slate-950',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
