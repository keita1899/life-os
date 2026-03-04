'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { SortableListItem } from '@/components/ui/sortable-list-item'
import { useSortableList } from '@/hooks/useSortableList'
import { RuleItem } from './RuleItem'
import { RuleForm } from './RuleForm'
import type { RuleItem as RuleItemType } from '../types/rule-item'

interface RuleListProps {
  items: RuleItemType[]
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCreate: (title: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
  showCreateForm?: boolean
  readOnly?: boolean
}

export function RuleList({
  items,
  onUpdate,
  onDelete,
  onCreate,
  onReorder,
  showCreateForm = true,
  readOnly = false,
}: RuleListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createKey, setCreateKey] = useState(0)

  const { sensors, handleDragEnd } = useSortableList({
    items,
    onReorder: onReorder ?? (async () => {}),
  })

  const handleCreate = async (title: string) => {
    await onCreate(title)
    setCreateKey((prev) => prev + 1)
  }

  const addButton = showCreateForm && (
    isCreating ? (
      <RuleForm
        key={createKey}
        onSubmit={handleCreate}
        onCancel={() => setIsCreating(false)}
      />
    ) : (
      <InlineCreateButton
        label="マイルールを追加"
        onClick={() => setIsCreating(true)}
      />
    )
  )

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-1">
          {onReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortableListItem key={item.id} id={item.id}>
                    <RuleItem
                      item={item}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      readOnly={readOnly}
                    />
                  </SortableListItem>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            items.map((item) => (
              <RuleItem
                key={item.id}
                item={item}
                onUpdate={onUpdate}
                onDelete={onDelete}
                readOnly={readOnly}
              />
            ))
          )}
        </div>
      )}
      {addButton}
    </div>
  )
}
