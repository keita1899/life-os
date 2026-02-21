'use client'

import type { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import {
  MARKDOWN_CONTAINER_CLASSES,
  REMARK_PLUGINS,
  REHYPE_PLUGINS,
} from '@/lib/markdown-shared'

import 'highlight.js/styles/github-dark.min.css'

interface MemoMarkdownProps {
  content: string
  className?: string
}

export function MemoMarkdown({
  content,
  className,
}: MemoMarkdownProps): ReactElement {
  return (
    <div className={cn(MARKDOWN_CONTAINER_CLASSES, className)}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
