'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { VisionItem } from './VisionItem'
import { VisionForm } from './VisionForm'
import type { VisionItem as VisionItemType } from '../types/vision-item'

interface VisionListProps {
  items: VisionItemType[]
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCreate: (title: string) => Promise<void>
  showCreateForm?: boolean
  readOnly?: boolean
}

export function VisionList({
  items,
  onUpdate,
  onDelete,
  onCreate,
  showCreateForm = true,
  readOnly = false,
}: VisionListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createKey, setCreateKey] = useState(0)

  const handleCreate = async (title: string) => {
    await onCreate(title)
    setCreateKey((prev) => prev + 1)
  }

  const addButton = showCreateForm && (
    isCreating ? (
      <VisionForm
        key={createKey}
        onSubmit={handleCreate}
        onCancel={() => setIsCreating(false)}
      />
    ) : (
      <InlineCreateButton
        label="ビジョンを追加"
        onClick={() => setIsCreating(true)}
      />
    )
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {items.length === 0 ? (
          <EmptyState message="ビジョンがありません" />
        ) : (
          items.map((item) => (
            <VisionItem
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              readOnly={readOnly}
            />
          ))
        )}
      </div>
      {addButton}
    </div>
  )
}
