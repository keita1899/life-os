'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface InlineEditableTextProps {
  value: string
  onSave: (newValue: string) => Promise<void>
  className?: string
  inputClassName?: string
  disabled?: boolean
}

export function InlineEditableText({
  value,
  onSave,
  className,
  inputClassName,
  disabled = false,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleSave = useCallback(async () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === value) {
      setDraft(value)
      setIsEditing(false)
      return
    }
    await onSave(trimmed)
    setIsEditing(false)
  }, [draft, value, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        void handleSave()
      } else if (e.key === 'Escape') {
        setDraft(value)
        setIsEditing(false)
      }
    },
    [handleSave, value],
  )

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void handleSave()}
        onKeyDown={handleKeyDown}
        className={cn('h-auto px-1 py-0 text-sm', inputClassName)}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <span
      onDoubleClick={(e) => {
        if (disabled) return
        e.stopPropagation()
        setIsEditing(true)
      }}
      onClick={(e) => {
        if (disabled) return
        e.stopPropagation()
        e.preventDefault()
      }}
      className={cn(disabled ? '' : 'cursor-text', className)}
    >
      {value}
    </span>
  )
}
