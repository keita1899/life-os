import { useRef, useCallback, useEffect } from 'react'

export function useAutoResizeTextarea(value?: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [adjustHeight, value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight()
    },
    [adjustHeight],
  )

  return {
    textareaRef,
    handleChange,
  }
}
