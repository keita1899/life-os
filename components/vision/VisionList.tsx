'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { VisionItem } from './VisionItem'
import { VisionForm } from './VisionForm'
import type { VisionItem as VisionItemType } from '@/lib/types/vision-item'

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

  const handleCreate = async (title: string) => {
    await onCreate(title)
    setIsCreating(false)
  }

  const addButton = showCreateForm && (
    isCreating ? (
      <VisionForm
        onSubmit={handleCreate}
        onCancel={() => setIsCreating(false)}
      />
    ) : (
      <Button
        variant="ghost"
        onClick={() => setIsCreating(true)}
        className="w-full justify-center text-muted-foreground hover:text-foreground"
      >
        + ビジョンを追加
      </Button>
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
