'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RoadmapSection } from '../types/roadmap-section'
import type { RoadmapSectionStatus } from '../types/roadmap-section'
import { SECTION_STATUS_LABELS } from '../types/roadmap-section'

const STATUS_COLORS: Record<RoadmapSectionStatus, string> = {
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  planned: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

interface RoadmapSectionHeaderProps {
  section: RoadmapSection
  isOpen: boolean
  taskCount: number
  onToggle: () => void
  onUpdateName: (name: string) => Promise<void>
  onUpdateStatus: (status: RoadmapSectionStatus) => Promise<void>
  onDelete: () => void
}

export function RoadmapSectionHeader({
  section,
  isOpen,
  taskCount,
  onToggle,
  onUpdateName,
  onUpdateStatus,
  onDelete,
}: RoadmapSectionHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(section.name)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    const trimmed = editName.trim()
    if (!trimmed || isSubmitting) return
    if (trimmed === section.name) {
      setIsEditing(false)
      return
    }
    setIsSubmitting(true)
    try {
      await onUpdateName(trimmed)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditName(section.name)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleSave()
            } else if (e.key === 'Escape') {
              handleCancel()
            }
          }}
          className="h-8 flex-1"
          disabled={isSubmitting}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => void handleSave()}
          disabled={isSubmitting}
          aria-label="保存"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCancel}
          aria-label="キャンセル"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span>{section.name}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight ${STATUS_COLORS[section.status]}`}
          >
            {SECTION_STATUS_LABELS[section.status]}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(
            Object.entries(SECTION_STATUS_LABELS) as [
              RoadmapSectionStatus,
              string,
            ][]
          ).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              onClick={() => void onUpdateStatus(value)}
            >
              <span className="flex items-center gap-2">
                {section.status === value ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[value]}`}
                >
                  {label}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setEditName(section.name)
            setIsEditing(true)
          }}
          aria-label="セクション名を編集"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label="セクションを削除"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
