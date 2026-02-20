import { useState, useCallback } from 'react'

interface UseCopyToClipboardOptions {
  resetDelayMs?: number
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): {
  copy: (text: string) => Promise<boolean>
  copied: boolean
} {
  const { resetDelayMs = 2000 } = options
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetDelayMs)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetDelayMs],
  )

  return { copy, copied }
}
