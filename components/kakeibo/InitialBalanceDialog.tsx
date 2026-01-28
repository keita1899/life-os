'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InitialBalanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (balance: number) => Promise<void>
}

export function InitialBalanceDialog({
  open,
  onOpenChange,
  onConfirm,
}: InitialBalanceDialogProps) {
  const [balance, setBalance] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const balanceNum = Number(balance.replace(/,/g, ''))
    if (isNaN(balanceNum) || balanceNum < 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(balanceNum)
      setBalance('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9,]/g, '')
    setBalance(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>家計簿を始める</DialogTitle>
          <DialogDescription>
            現在の残高を入力してください。この値は家計簿の計算の基準となります。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="balance">現在の残高（円）</Label>
              <Input
                id="balance"
                type="text"
                placeholder="例: 1,000,000"
                value={balance}
                onChange={handleBalanceChange}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting || !balance}>
              {isSubmitting ? '設定中...' : '設定する'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
