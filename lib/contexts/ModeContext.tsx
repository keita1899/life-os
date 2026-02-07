'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type AppMode = 'life' | 'development'

interface ModeContextType {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

const MODE_STORAGE_KEY = 'life-os-mode'

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('life')

  useEffect(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY)
    if (stored === 'life' || stored === 'development') {
      setModeState(stored)
    }
  }, [])

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

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}
