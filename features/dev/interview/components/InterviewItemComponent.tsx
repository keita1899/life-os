'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle } from 'lucide-react'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { SortableDragHandle } from '@/components/ui/sortable-list-item'
import { cn } from '@/lib/utils'
import type { InterviewItem, UpdateInterviewItemInput } from '../types/interview-item'

interface InterviewItemComponentProps {
  item: InterviewItem
  onEdit: (item: InterviewItem) => void
  onDelete: (item: InterviewItem) => void
  onUpdate: (id: number, input: UpdateInterviewItemInput) => Promise<void>
}

type EditingField = 'question' | 'answer' | null

export function InterviewItemComponent({
  item,
  onEdit,
  onDelete,
  onUpdate,
}: InterviewItemComponentProps) {
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingField === 'question') {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else if (editingField === 'answer') {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
    }
  }, [editingField])

  const startEdit = useCallback((field: 'question' | 'answer') => {
    setEditingField(field)
    setEditValue(field === 'question' ? item.question : item.answer ?? '')
  }, [item.question, item.answer])

  const cancelEdit = useCallback(() => {
    setEditingField(null)
    setEditValue('')
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingField) return
    const trimmed = editValue.trim()

    try {
      if (editingField === 'question') {
        if (trimmed && trimmed !== item.question) {
          await onUpdate(item.id, { question: trimmed })
        }
      } else {
        const newAnswer = trimmed || null
        if (newAnswer !== item.answer) {
          await onUpdate(item.id, { answer: newAnswer })
        }
      }
      setEditingField(null)
      setEditValue('')
    } catch {
      // エラー時は編集状態を維持
    }
  }, [editingField, editValue, item, onUpdate])

  const handleQuestionKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }, [saveEdit, cancelEdit])

  const handleAnswerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }, [saveEdit, cancelEdit])

  return (
    <div className="group rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900">
      <div className="flex items-start gap-3">
        <SortableDragHandle />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Q
            </span>
            {editingField === 'question' ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleQuestionKeyDown}
                onBlur={saveEdit}
                className="flex-1 rounded border border-blue-300 bg-background px-2 py-0.5 text-sm font-medium text-stone-900 outline-none focus:ring-2 focus:ring-blue-400 dark:border-blue-700 dark:text-stone-100"
              />
            ) : (
              <p
                className="text-sm font-medium text-stone-900 dark:text-stone-100 cursor-text"
                onDoubleClick={() => startEdit('question')}
              >
                {item.question}
              </p>
            )}
          </div>
          {editingField === 'answer' ? (
            <div className="mt-3 flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                A
              </span>
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleAnswerKeyDown}
                onBlur={saveEdit}
                rows={4}
                className="flex-1 resize-y rounded border border-green-300 bg-background px-2 py-1 text-sm text-muted-foreground outline-none focus:ring-2 focus:ring-green-400 dark:border-green-700"
              />
            </div>
          ) : item.answer ? (
            <div className="mt-3 flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                A
              </span>
              <p
                className={cn(
                  'text-sm whitespace-pre-wrap break-words text-muted-foreground cursor-text',
                )}
                onDoubleClick={() => startEdit('answer')}
              >
                {item.answer}
              </p>
            </div>
          ) : (
            <div
              className="mt-3 flex items-center gap-2 cursor-text"
              onDoubleClick={() => startEdit('answer')}
            >
              <span className="mt-0.5 shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                A
              </span>
              <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                未回答
              </span>
            </div>
          )}
        </div>
        <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <EditDeleteDropdownMenu
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </div>
      </div>
    </div>
  )
}
