import type { ReactNode } from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'

interface DragOverlayPreviewProps {
  activeItem: { title: string } | null
  /** アイテム名の前に表示する追加アイコン */
  icon?: ReactNode
}

/** ドラッグ中のアイテムプレビュー */
export function DragOverlayPreview({ activeItem, icon }: DragOverlayPreviewProps) {
  return (
    <DragOverlay dropAnimation={null}>
      {activeItem && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/50 bg-background p-4 shadow-lg">
          <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {icon}
          <span className="text-sm font-medium">{activeItem.title}</span>
        </div>
      )}
    </DragOverlay>
  )
}
