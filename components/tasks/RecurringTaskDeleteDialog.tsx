'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type DeleteMode = 'single' | 'all'

interface RecurringTaskDeleteDialogProps {
  open: boolean
  taskTitle: string
  onConfirm: (mode: DeleteMode) => void | Promise<void>
  onCancel: () => void
}

export const RecurringTaskDeleteDialog = ({
  open,
  taskTitle,
  onConfirm,
  onCancel,
}: RecurringTaskDeleteDialogProps) => {
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single')
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    if (isConfirming) return
    setIsConfirming(true)
    try {
      await onConfirm(deleteMode)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && !isConfirming && onCancel()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>削除の確認</DialogTitle>
          <DialogDescription>
            「{taskTitle}」を削除しますか？
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div className="text-sm font-medium">削除方法を選択</div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant={deleteMode === 'single' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setDeleteMode('single')}
            >
              この1回だけ削除
            </Button>
            <Button
              type="button"
              variant={deleteMode === 'all' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setDeleteMode('all')}
            >
              すべての繰り返しを削除
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

