'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useBucketListCategories } from '@/hooks/useBucketListCategories'
import type {
  BucketListCategory,
  CreateBucketListCategoryInput,
  UpdateBucketListCategoryInput,
} from '@/lib/types/bucket-list-category'

export function BucketListCategoryManagement() {
  const {
    categories,
    isLoading,
    error,
    createBucketListCategory,
    updateBucketListCategory,
    deleteBucketListCategory,
  } = useBucketListCategories()
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  )
  const [editingName, setEditingName] = useState<string>('')
  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const [deletingCategory, setDeletingCategory] = useState<
    BucketListCategory | undefined
  >(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      setOperationError(null)
      setIsCreating(true)
      await createBucketListCategory({ name: newCategoryName.trim() })
      setNewCategoryName('')
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEdit = (category: BucketListCategory) => {
    setEditingCategoryId(category.id)
    setEditingName(category.name)
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
    setEditingName('')
  }

  const handleUpdateCategory = async (id: number) => {
    if (!editingName.trim()) return

    try {
      setOperationError(null)
      const updateInput: UpdateBucketListCategoryInput = {
        name: editingName.trim(),
      }
      await updateBucketListCategory(id, updateInput)
      setEditingCategoryId(null)
      setEditingName('')
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの更新に失敗しました',
      )
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    try {
      setOperationError(null)
      await deleteBucketListCategory(deletingCategory.id)
      setDeletingCategory(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'カテゴリーの削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (category: BucketListCategory) => {
    setDeletingCategory(category)
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreateCategory}
        className="flex items-center gap-2"
      >
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="カテゴリー名を入力"
          className="flex-1"
          disabled={isCreating}
        />
        <Button type="submit" disabled={isCreating || !newCategoryName.trim()}>
          {isCreating ? '作成中...' : '作成'}
        </Button>
      </form>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
          <p className="text-muted-foreground">カテゴリーがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              {editingCategoryId === category.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (editingName.trim()) {
                          handleUpdateCategory(category.id)
                        }
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        handleCancelEdit()
                      }
                    }}
                    className="flex-1 max-w-[calc(100%-120px)]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdateCategory(category.id)}
                      className="h-8 w-8"
                      disabled={!editingName.trim()}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">保存</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">キャンセル</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span
                    className="cursor-pointer font-medium"
                    onDoubleClick={() => handleStartEdit(category)}
                  >
                    {category.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">編集</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deletingCategory}
        message={`「${deletingCategory?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCategory(undefined)}
      />
    </div>
  )
}
