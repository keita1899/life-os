'use client'

import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface EditDeleteDropdownMenuProps {
  onEdit?: () => void
  onDelete?: (e: React.MouseEvent) => void
  triggerClassName?: string
  children?: React.ReactNode
}

export function EditDeleteDropdownMenu({
  onEdit,
  onDelete,
  triggerClassName,
  children,
}: EditDeleteDropdownMenuProps) {
  const hasActions = onEdit || onDelete || children

  if (!hasActions) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 p-0', triggerClassName)}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">メニュー</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>編集</span>
          </DropdownMenuItem>
        )}
        {children}
        {onDelete && (
          <DropdownMenuItem
            onClick={(e) => onDelete(e)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>削除</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
