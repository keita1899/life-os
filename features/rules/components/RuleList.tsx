'use client'

import { useState } from 'react'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { RuleItem } from './RuleItem'
import { RuleForm } from './RuleForm'
import type { RuleItem as RuleItemType } from '../types/rule-item'

interface RuleListProps {
  items: RuleItemType[]
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCreate: (title: string) => Promise<void>
  showCreateForm?: boolean
  readOnly?: boolean
}

export function RuleList({
  items,
  onUpdate,
  onDelete,
  onCreate,
  showCreateForm = true,
  readOnly = false,
}: RuleListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createKey, setCreateKey] = useState(0)

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
          {items.map((item) => (
            <RuleItem
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
      {addButton}
    </div>
  )
}
