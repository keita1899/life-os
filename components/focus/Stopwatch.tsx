'use client'

import { useState } from 'react'
import { useElapsedTime } from 'use-elapsed-time'

interface UseStopwatchOptions {
  onTimeUpdate?: (seconds: number) => void
}

export function useStopwatch({ onTimeUpdate }: UseStopwatchOptions = {}) {
  const [isRunning, setIsRunning] = useState(false)
  const { elapsedTime, reset: resetElapsed } = useElapsedTime({
    isPlaying: isRunning,
    updateInterval: 1,
    onUpdate: (elapsed) => onTimeUpdate?.(Math.floor(elapsed)),
  })

  const elapsedSeconds = Math.floor(elapsedTime)

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
    resetElapsed(0)
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
