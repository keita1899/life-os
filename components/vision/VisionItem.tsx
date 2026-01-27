'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import type { VisionItem as VisionItemType } from '@/lib/types/vision-item'
import { VisionForm } from './VisionForm'

interface VisionItemProps {
  item: VisionItemType
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  readOnly?: boolean
}

export function VisionItem({ item, onUpdate, onDelete, readOnly = false }: VisionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (title: string) => {
    await onUpdate(item.id, title)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await onDelete(item.id)
    setIsDeleting(false)
  }

  if (isEditing) {
    return (
      <VisionForm
        initialTitle={item.title}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <>
      <div className={`group flex items-center gap-3 rounded-md py-2 transition-colors ${readOnly ? '' : 'hover:bg-accent/50'}`}>
        <div className="flex-1 text-sm">{item.title}</div>
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7"
              aria-label="編集"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleting(true)}
              className="h-7 w-7"
              aria-label="削除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {!readOnly && (
        <DeleteConfirmDialog
          open={isDeleting}
          onCancel={() => setIsDeleting(false)}
          onConfirm={handleDelete}
          message={`「${item.title}」を削除しますか？`}
        />
      )}
    </>
  )
}
