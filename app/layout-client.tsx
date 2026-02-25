'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { useAppMode } from '@/hooks/useAppMode'
import { ReviewWizard, useReviewWizard } from '@/features/review'
import { useNotificationScheduler } from '@/features/notifications'
import { ProjectSwitcher } from '@/features/dev/projects'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { cn } from '@/lib/utils'

const SIDEBAR_STORAGE_KEY = 'sidebar-open'

function getSidebarStateFromStorage(): boolean {
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

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const router = useRouter()
  const { mode } = useAppMode()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  useNotificationScheduler()

  useEffect(() => {
    setIsSidebarOpen(getSidebarStateFromStorage())
  }, [])

  useHotkeys(
    'mod+h',
    () => router.push(mode === 'development' ? '/dev' : '/'),
    { enableOnFormTags: false, preventDefault: true },
    [mode, router],
  )
  useHotkeys(
    'd',
    () => router.push(mode === 'development' ? '/dev/logs' : '/logs'),
    { enableOnFormTags: false, preventDefault: true },
    [mode, router],
  )
  useHotkeys(
    'm',
    () => router.push(mode === 'development' ? '/dev?view=month' : '/?view=month'),
    { enableOnFormTags: false, preventDefault: true },
    [mode, router],
  )
  useHotkeys(
    'w',
    () => router.push(mode === 'development' ? '/dev?view=week' : '/?view=week'),
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

  const { activeWizard, handleComplete } = useReviewWizard()

  return (
    <>
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
      {activeWizard && (
        <ReviewWizard key={activeWizard} type={activeWizard} onComplete={handleComplete} />
      )}
      {mode === 'development' && <ProjectSwitcher />}
    </>
  )
}
