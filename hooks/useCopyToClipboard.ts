import { useState, useCallback, useRef, useEffect } from 'react'

interface UseCopyToClipboardOptions {
  resetDelayMs?: number
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): {
  copy: (text: string) => Promise<boolean>
  isCopied: boolean
} {
  const { resetDelayMs = 2000 } = options
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text)
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current)
        }
        setIsCopied(true)
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null
          setIsCopied(false)
        }, resetDelayMs)
        return true
      } catch {
        setIsCopied(false)
        return false
      }
    },
    [resetDelayMs],
  )

  return { copy, isCopied }
}
