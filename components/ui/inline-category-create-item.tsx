'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineCategoryCreateItemProps {
  onSubmit: (name: string) => Promise<void>
  className?: string
  label?: string
  placeholder?: string
}

export function InlineCategoryCreateItem({
  onSubmit,
  className,
  label = 'カテゴリーを追加',
  placeholder = 'カテゴリー名',
}: InlineCategoryCreateItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setName('')
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-md py-1.5 px-2',
          className,
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!name.trim()) handleCancel()
          }}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="h-7 min-w-0 flex-1 rounded border border-stone-300 bg-transparent px-2 text-sm outline-none focus:border-stone-500 dark:border-stone-600 dark:focus:border-stone-400"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !name.trim()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-stone-200 hover:text-foreground disabled:opacity-40 dark:hover:bg-stone-700"
          aria-label="追加"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-stone-200 hover:text-foreground dark:hover:bg-stone-700"
          aria-label="キャンセル"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'group/create flex w-full items-center gap-2 rounded-md py-2 px-2 text-sm transition-colors',
        'text-muted-foreground hover:bg-stone-800 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <Plus className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </button>
  )
}
