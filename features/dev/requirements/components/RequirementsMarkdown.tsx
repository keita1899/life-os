'use client'

import type { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import {
  MARKDOWN_CONTAINER_CLASSES,
  REMARK_PLUGINS,
  REHYPE_PLUGINS,
} from '@/lib/markdown-shared'

import 'highlight.js/styles/github.min.css'

interface RequirementsMarkdownProps {
  content: string
  className?: string
}

export function RequirementsMarkdown({
  content,
  className,
}: RequirementsMarkdownProps): ReactElement {
  return (
    <div className={cn(MARKDOWN_CONTAINER_CLASSES, className)}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
