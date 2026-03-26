'use client'

import { useCallback, useState } from 'react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import { SortableDragHandle } from '@/components/ui/sortable-list-item'
import type { RuleItem as RuleItemType } from '../types/rule-item'

interface RuleItemProps {
  item: RuleItemType
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  readOnly?: boolean
}

export function RuleItem({ item, onUpdate, onDelete, readOnly = false }: RuleItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = useCallback(async (title: string) => {
    await onUpdate(item.id, title)
  }, [item.id, onUpdate])

  const handleDelete = async () => {
    await onDelete(item.id)
    setIsDeleting(false)
  }

  return (
    <>
      <div className={`group flex items-center gap-3 rounded-md px-2 py-2 transition-colors ${readOnly ? '' : 'hover:bg-accent/50'}`}>
        {!readOnly && <SortableDragHandle />}
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
        <div className="flex-1 text-sm">
          <InlineEditableText
            value={item.title}
            onSave={handleSave}
            disabled={readOnly}
          />
        </div>
        {!readOnly && (
          <EditDeleteDropdownMenu
            onDelete={() => setIsDeleting(true)}
            triggerClassName="opacity-0 transition-opacity group-hover:opacity-100"
          />
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
