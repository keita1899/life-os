'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type AppMode = 'life' | 'development'

interface ModeContextType {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

const MODE_STORAGE_KEY = 'life-os-mode'
const LAST_PATH_STORAGE_KEY = 'life-os-last-path'

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof window === 'undefined') return 'life'
    const stored = localStorage.getItem(MODE_STORAGE_KEY)
    return stored === 'life' || stored === 'development' ? stored : 'life'
  })

  const setMode = (newMode: AppMode) => {
    setModeState(newMode)
    localStorage.setItem(MODE_STORAGE_KEY, newMode)
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function getLastPath(): string {
  if (typeof window === 'undefined') return '/'
  return localStorage.getItem(LAST_PATH_STORAGE_KEY) || '/'
}

export function setLastPath(path: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAST_PATH_STORAGE_KEY, path)
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}
