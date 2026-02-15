import { useEffect } from 'react'

export function useSessionHistory(isSessionActive: boolean) {
  useEffect(() => {
    if (!isSessionActive) return

    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href)
      e.preventDefault()
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isSessionActive])
}
