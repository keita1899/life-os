'use client'

import { usePathname } from 'next/navigation'

export type AppMode = 'life' | 'development'

export function useAppMode(): { mode: AppMode; isDevMode: boolean } {
  const pathname = usePathname()
  const isDevMode = pathname?.startsWith('/dev') ?? false
  const mode: AppMode = isDevMode ? 'development' : 'life'
  return { mode, isDevMode }
}
