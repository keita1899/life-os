'use client'

import * as React from 'react'
import { useCallback, useRef } from 'react'
import TextareaMarkdown from 'textarea-markdown-editor'
import { AutoResizeTextarea } from './textarea-autosize'

const MARKDOWN_COMMANDS = [
  { name: 'bold' as const, shortcut: 'mod+b' },
  { name: 'italic' as const, shortcut: 'mod+i' },
]

type MarkdownTextareaProps = React.ComponentProps<typeof AutoResizeTextarea>

const MarkdownTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MarkdownTextareaProps
>((props, forwardedRef) => {
  const prevNodeRef = useRef<HTMLTextAreaElement | null>(null)
  const justComposedRef = useRef(false)

  const handleCompositionEnd = useCallback(() => {
    justComposedRef.current = true
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.isComposing || justComposedRef.current)) {
      e.stopImmediatePropagation()
    }
    justComposedRef.current = false
  }, [])

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (prevNodeRef.current) {
        prevNodeRef.current.removeEventListener('compositionend', handleCompositionEnd, true)
        prevNodeRef.current.removeEventListener('keydown', handleKeyDown, true)
      }
      prevNodeRef.current = node
      if (node) {
        node.addEventListener('compositionend', handleCompositionEnd, true)
        node.addEventListener('keydown', handleKeyDown, true)
      }

      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
      }
    },
    [forwardedRef, handleCompositionEnd, handleKeyDown],
  )

  return (
    <TextareaMarkdown.Wrapper commands={MARKDOWN_COMMANDS}>
      <AutoResizeTextarea ref={setRefs} {...props} />
    </TextareaMarkdown.Wrapper>
  )
})
MarkdownTextarea.displayName = 'MarkdownTextarea'

export { MarkdownTextarea }
