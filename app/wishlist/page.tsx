'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { WishlistCategoryManagement } from '@/components/wishlist/WishlistCategoryManagement'
import { useMode } from '@/lib/contexts/ModeContext'

export default function WishlistPage() {
  const { mode } = useMode()
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] =
    useState(false)

  if (mode !== 'life') {
    return null
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">欲しいものリスト</h1>
            <Button
              variant="outline"
              onClick={() => setIsCategoryManagementOpen(true)}
            >
              カテゴリー管理
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
          <p className="text-muted-foreground">
            欲しいものリスト機能は準備中です
          </p>
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
    </MainLayout>
  )
}
