'use client'

import { useState } from 'react'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import { StickyNote, Search } from 'lucide-react'
import {
  useDevMemos,
  MemoDialog,
  MemoList,
} from '@/features/dev/memos'
import type {
  DevMemo,
  CreateDevMemoInput,
  DevMemosOrderBy,
} from '@/features/dev/memos'
import { useDevProjects } from '@/features/dev/projects'
import { Loading } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function DevMemosPage() {
  const [keyword, setKeyword] = useState('')
  const [orderBy, setOrderBy] = useState<DevMemosOrderBy>('newest')
  const { memos, isLoading, error, createMemo, updateMemo, deleteMemo } =
    useDevMemos({
      keyword: keyword.trim() || undefined,
      orderBy,
    })
  const { projects } = useDevProjects()
  const memoDialog = useDialogState<DevMemo>()
  const deleteConfirm = useDeleteConfirm<DevMemo>()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useCreateShortcut({
    onCreate: memoDialog.handleCreateClick,
    enabled: !memoDialog.isDialogOpen,
  })

  const handleCreateMemo = async (
    input: CreateDevMemoInput,
  ): Promise<void> => {
    await createMemo(input)
    memoDialog.handleDialogClose(false)
  }

  const handleUpdateMemo = async (
    input: CreateDevMemoInput,
  ): Promise<void> => {
    const memo = memoDialog.editingItem
    if (!memo) return
    await updateMemo(memo.id, input)
    memoDialog.handleDialogClose(false)
  }

  const handleDeleteMemo = async (): Promise<void> => {
    const memo = deleteConfirm.deletingItem
    if (!memo) return
    await deleteMemo(memo.id)
    deleteConfirm.clearDeletingItem()
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <StickyNote className="h-8 w-8" />
            メモ
          </h1>
          <CreateButton
            label="メモを作成"
            onClick={memoDialog.handleCreateClick}
            title="⌘N で作成"
          />
        </div>

        {error && (
          <div className="mb-4 text-destructive">{error}</div>
        )}

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="本文で検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={orderBy}
            onValueChange={(v) => setOrderBy(v as DevMemosOrderBy)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新しい順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <MemoList
            memos={memos}
            projects={projects}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            onEdit={memoDialog.handleEdit}
            onDelete={deleteConfirm.handleDeleteClick}
          />
        )}

        <MemoDialog
          open={memoDialog.isDialogOpen}
          onOpenChange={memoDialog.handleDialogClose}
          onSubmit={
            memoDialog.editingItem ? handleUpdateMemo : handleCreateMemo
          }
          memo={memoDialog.editingItem}
        />

        <DeleteConfirmDialog
          open={!!deleteConfirm.deletingItem}
          message={`このメモを削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteMemo}
          onCancel={deleteConfirm.handleDeleteCancel}
        />

        <FloatingActionButtons
          actions={[
            {
              id: 'new-memo',
              label: 'メモを作成',
              icon: <StickyNote className="h-5 w-5" />,
              onClick: memoDialog.handleCreateClick,
            },
          ]}
        />
      </div>
    </>
  )
}
