'use client'

import { useState, useEffect } from 'react'

interface UseStopwatchOptions {
  onTimeUpdate?: (seconds: number) => void
}

export function useStopwatch({ onTimeUpdate }: UseStopwatchOptions = {}) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1
        onTimeUpdate?.(next)
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onTimeUpdate])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const start = () => {
    setIsRunning(true)
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
    onTimeUpdate?.(0)
  }

  return {
    elapsedSeconds,
    isRunning,
    formattedTime: formatTime(elapsedSeconds),
    start,
    pause,
    reset,
  }
}
