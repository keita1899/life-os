'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { InterviewItemComponent } from './InterviewItemComponent'
import type { InterviewItem, UpdateInterviewItemInput } from '../types/interview-item'

interface InterviewListProps {
  items: InterviewItem[]
  onEdit: (item: InterviewItem) => void
  onDelete: (item: InterviewItem) => void
  onUpdate: (id: number, input: UpdateInterviewItemInput) => Promise<void>
  onCreate: () => void
}

export function InterviewList({
  items,
  onEdit,
  onDelete,
  onUpdate,
  onCreate,
}: InterviewListProps) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <EmptyState message="Q&Aがありません" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <InterviewItemComponent
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
      <InlineCreateButton label="Q&Aを追加" onClick={onCreate} />
    </div>
  )
}
