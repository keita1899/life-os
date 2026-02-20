'use client'

import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

import 'highlight.js/styles/github-dark.min.css'

interface MemoMarkdownProps {
  content: string
  className?: string
}

export function MemoMarkdown({ content, className }: MemoMarkdownProps) {
  return (
    <div
      className={cn(
        'text-sm [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:text-xs',
        '[&_pre_code]:p-0 [&_pre_code]:bg-transparent [&_pre_code]:text-inherit',
        '[&_ul]:my-2 [&_ol]:my-2 [&_p]:my-1 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_a]:underline',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true }]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
