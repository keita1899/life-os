'use client'

import { createContext, useContext } from 'react'

interface FocusSessionActiveContextValue {
  isActive: boolean
  setActive: (active: boolean) => void
}

export const FocusSessionActiveContext = createContext<FocusSessionActiveContextValue>({
  isActive: false,
  setActive: () => {},
})

export function useFocusSessionActive() {
  return useContext(FocusSessionActiveContext)
}
