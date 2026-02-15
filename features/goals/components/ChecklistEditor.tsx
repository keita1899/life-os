'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ChecklistItem, MAX_CHECKLIST_ITEMS } from '@/features/goals'

interface ChecklistEditorProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const handleAddItem = () => {
    if (items.length >= MAX_CHECKLIST_ITEMS) return
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      completed: false,
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleUpdateItem = (id: string, updates: Partial<ChecklistItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">チェックリスト</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              value={item.text}
              onChange={(e) =>
                handleUpdateItem(item.id, { text: e.target.value })
              }
              placeholder="チェックリスト項目を入力"
              className={cn(
                'flex-1',
                item.completed && 'line-through text-muted-foreground',
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(item.id)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length < MAX_CHECKLIST_ITEMS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            項目を追加
          </Button>
        )}
        {items.length >= MAX_CHECKLIST_ITEMS && (
          <p className="text-xs text-muted-foreground">
            チェックリストは最大{MAX_CHECKLIST_ITEMS}個まで追加できます
          </p>
        )}
      </div>
    </div>
  )
}
