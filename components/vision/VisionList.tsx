'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisionItem } from './VisionItem'
import { VisionForm } from './VisionForm'
import type { VisionItem as VisionItemType } from '@/lib/types/vision-item'

interface VisionListProps {
  items: VisionItemType[]
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCreate: (title: string) => Promise<void>
  showCreateForm?: boolean
}

export function VisionList({
  items,
  onUpdate,
  onDelete,
  onCreate,
  showCreateForm = true,
}: VisionListProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (title: string) => {
    await onCreate(title)
    setIsCreating(false)
  }

  if (items.length === 0 && !isCreating) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-stone-50/30 p-8 text-center dark:bg-stone-950/30">
          <p className="text-muted-foreground">ビジョンがありません</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsCreating(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          ビジョンを追加
        </Button>
        {isCreating && (
          <VisionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {items.map((item) => (
          <VisionItem
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
      {showCreateForm &&
        (isCreating ? (
          <VisionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            ビジョンを追加
          </Button>
        ))}
    </div>
  )
}
