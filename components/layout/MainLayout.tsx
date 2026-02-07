'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
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
  const router = useRouter()
  const { mode } = useMode()
  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState)

  useHotkeys(
    'mod+h',
    () => router.push('/'),
    { enableOnFormTags: false, preventDefault: true },
    [router],
  )
  useHotkeys(
    'd',
    () => router.push(mode === 'development' ? '/dev/logs' : '/logs'),
    { enableOnFormTags: false, preventDefault: true },
    [mode, router],
  )

  const handleOpenChange = useCallback((open: boolean): void => {
    setIsSidebarOpen(open)
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open))
    } catch {
      // localStorage access failed, ignore safely
    }
  }, [])

  useHotkeys(
    'mod+b',
    () => handleOpenChange(!isSidebarOpen),
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
    [handleOpenChange, isSidebarOpen],
  )

  const handleMenuClick = useCallback((): void => {
    handleOpenChange(!isSidebarOpen)
  }, [handleOpenChange, isSidebarOpen])

  return (
    <div className="flex min-h-screen">
      <Sidebar open={isSidebarOpen} onOpenChange={handleOpenChange} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={handleMenuClick} />
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
