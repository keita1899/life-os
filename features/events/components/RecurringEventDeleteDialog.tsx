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

interface RecurringEventDeleteDialogProps {
  open: boolean
  eventTitle: string
  onConfirm: (mode: DeleteMode) => void | Promise<void>
  onCancel: () => void
}

export const RecurringEventDeleteDialog = ({
  open,
  eventTitle,
  onConfirm,
  onCancel,
}: RecurringEventDeleteDialogProps) => {
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
            「{eventTitle}」を削除しますか？
          </DialogDescription>
        </DialogHeader>
        <fieldset className="py-4 space-y-3">
          <legend className="text-sm font-medium">削除方法を選択</legend>
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-input px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="deleteMode"
                value="single"
                checked={deleteMode === 'single'}
                onChange={() => setDeleteMode('single')}
                className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm">この1回だけ削除</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-input px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="deleteMode"
                value="all"
                checked={deleteMode === 'all'}
                onChange={() => setDeleteMode('all')}
                className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm">すべての繰り返しを削除</span>
            </label>
          </div>
        </fieldset>
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
