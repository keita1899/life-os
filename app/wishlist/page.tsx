'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { WishlistCategoryManagement } from '@/components/wishlist/WishlistCategoryManagement'
import { useMode } from '@/lib/contexts/ModeContext'

export default function WishlistPage() {
  const { mode } = useMode()
  const [operationError, setOperationError] = useState<string | null>(null)
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false)

  if (mode !== 'life') {
    return null
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">やりたいことリスト</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryManagementOpen(true)}
            >
              カテゴリー管理
            </Button>
            <Button disabled>やりたいことを作成</Button>
          </div>
        </div>
      </div>

      <ErrorMessage
        message={operationError || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">やりたいことリスト機能は実装中です</p>
      </div>

      <Dialog
        open={isCategoryManagementOpen}
        onOpenChange={setIsCategoryManagementOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>カテゴリー管理</DialogTitle>
          </DialogHeader>
          <WishlistCategoryManagement />
        </DialogContent>
      </Dialog>
    </div>
  )
}
