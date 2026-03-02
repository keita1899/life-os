'use client'

import * as React from 'react'
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
>((props, ref) => {
  return (
    <TextareaMarkdown.Wrapper commands={MARKDOWN_COMMANDS}>
      <AutoResizeTextarea ref={ref} {...props} />
    </TextareaMarkdown.Wrapper>
  )
})
MarkdownTextarea.displayName = 'MarkdownTextarea'

export { MarkdownTextarea }
