'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

const SIDEBAR_STORAGE_KEY = 'sidebar-open'

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (saved !== null) {
      setIsSidebarOpen(saved === 'true')
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsSidebarOpen(open)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open))
  }

  const handleMenuClick = () => {
    handleOpenChange(!isSidebarOpen)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={isSidebarOpen} onOpenChange={handleOpenChange} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
