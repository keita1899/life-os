'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { useAppMode } from '@/hooks/useAppMode'
import { FocusSessionActiveContext } from '@/hooks/useFocusSessionActive'
import { ReviewWizard, useReviewWizard } from '@/features/review'
import { useNotificationScheduler } from '@/features/notifications'
import { ProjectSwitcher } from '@/features/dev/projects'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'

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
  const pathname = usePathname()
  const { mode } = useAppMode()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFocusSessionActive, setFocusSessionActive] = useState(false)
  const focusSessionContextValue = useMemo(
    () => ({ isActive: isFocusSessionActive, setActive: setFocusSessionActive }),
    [isFocusSessionActive],
  )
  useNotificationScheduler()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage はマウント後にのみ読み取り可能
    setIsSidebarOpen(getSidebarStateFromStorage())
  }, [])

  useHotkeys(
    'mod+h',
    () => router.push(mode === 'development' ? '/dev' : '/'),
    { enableOnFormTags: false, preventDefault: true, enabled: !isFocusSessionActive },
    [mode, router, isFocusSessionActive],
  )
  useHotkeys(
    'd',
    () => router.push(mode === 'development' ? '/dev/logs' : '/logs'),
    { enableOnFormTags: false, preventDefault: true, enabled: !isFocusSessionActive },
    [mode, router, isFocusSessionActive],
  )
  const isHabitsPage = pathname === '/habits'
  useHotkeys(
    'm',
    () => router.push(mode === 'development' ? '/dev?view=month' : '/?view=month'),
    { enableOnFormTags: false, preventDefault: true, enabled: !isFocusSessionActive && !isHabitsPage },
    [mode, router, isFocusSessionActive, isHabitsPage],
  )
  useHotkeys(
    'w',
    () => router.push(mode === 'development' ? '/dev?view=week' : '/?view=week'),
    { enableOnFormTags: false, preventDefault: true, enabled: !isFocusSessionActive && !isHabitsPage },
    [mode, router, isFocusSessionActive, isHabitsPage],
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
      enabled: !isFocusSessionActive,
    },
    [handleOpenChange, isSidebarOpen, isFocusSessionActive],
  )

  const handleMenuClick = useCallback((): void => {
    handleOpenChange(!isSidebarOpen)
  }, [handleOpenChange, isSidebarOpen])

  const { activeWizard, handleComplete } = useReviewWizard()

  return (
    <FocusSessionActiveContext.Provider value={focusSessionContextValue}>
      <TooltipProvider delayDuration={400}>
        <div className="flex min-h-screen">
          {!isFocusSessionActive && (
            <Sidebar open={isSidebarOpen} onOpenChange={handleOpenChange} />
          )}
          <div className="flex flex-1 flex-col min-w-0">
            {!isFocusSessionActive && (
              <Header onMenuClick={handleMenuClick} />
            )}
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
        {!isFocusSessionActive && activeWizard && (
          <ReviewWizard key={activeWizard} type={activeWizard} onComplete={handleComplete} />
        )}
        {!isFocusSessionActive && mode === 'development' && <ProjectSwitcher />}
      </TooltipProvider>
    </FocusSessionActiveContext.Provider>
  )
}
