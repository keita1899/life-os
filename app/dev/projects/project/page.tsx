'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { mutate } from 'swr'
import { MainLayout } from '@/components/layout/MainLayout'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { Badge } from '@/components/ui/badge'
import { useMode } from '@/lib/contexts/ModeContext'
import { fetcher } from '@/lib/swr'
import { deleteDevProject, getDevProjectById, updateDevProject } from '@/lib/dev/projects'
import type { DevProject, ProjectStatus } from '@/lib/types/dev-project'
import { Button } from '@/components/ui/button'
import { ProjectDialog } from '@/components/dev/projects/ProjectDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { useState } from 'react'

const statusLabels: Record<ProjectStatus, string> = {
  draft: '下書き',
  in_progress: '進行中',
  released: 'リリース済み',
}

const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  released: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function formatDate(date: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function DevProjectPage() {
  const { mode } = useMode()
  const router = useRouter()
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const projectId = idParam ? Number(idParam) : NaN

  const shouldFetch = mode === 'development' && Number.isFinite(projectId)

  const { data, error, isLoading } = useSWR<DevProject | null>(
    shouldFetch ? `dev-project-${projectId}` : null,
    () => fetcher(() => getDevProjectById(projectId)),
  )

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (mode !== 'development') {
    return null
  }

  const handleUpdate = async (input: {
    name: string
    startDate?: string | null
    endDate?: string | null
    status?: ProjectStatus
  }) => {
    if (!Number.isFinite(projectId)) return
    await updateDevProject(projectId, input)
    await Promise.all([
      mutate(`dev-project-${projectId}`),
      mutate('dev-projects'),
    ])
    setIsEditDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!Number.isFinite(projectId)) return
    try {
      setDeleteError(null)
      await deleteDevProject(projectId)
      await mutate('dev-projects')
      router.push('/dev/projects')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '削除に失敗しました')
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dev/projects"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              ← プロジェクト一覧へ
            </Link>
            <h1 className="mt-2 text-3xl font-bold">
              {data?.name ?? 'プロジェクト'}
            </h1>
          </div>
          {data && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                削除
              </Button>
            </div>
          )}
        </div>

        <ErrorMessage
          message={deleteError || ''}
          onDismiss={deleteError ? () => setDeleteError(null) : undefined}
        />

        {!Number.isFinite(projectId) && (
          <ErrorMessage message="不正なプロジェクトIDです" />
        )}

        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage
            message={error instanceof Error ? error.message : '取得に失敗しました'}
          />
        ) : !data ? (
          <ErrorMessage message="プロジェクトが見つかりませんでした" />
        ) : (
          <div className="space-y-6">
            <section>
              <div className="mt-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      開始日
                    </dt>
                    <dd className="mt-1 text-sm">
                      {formatDate(data.startDate) ?? '未設定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      期限（終了日）
                    </dt>
                    <dd className="mt-1 text-sm">
                      {formatDate(data.endDate) ?? '未設定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      ステータス
                    </dt>
                    <dd className="mt-1">
                      <Badge className={statusColors[data.status]}>
                        {statusLabels[data.status]}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </div>
        )}

        <ProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          project={data || undefined}
        />

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          message={data ? `「${data.name}」を削除してもよろしいですか？` : ''}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      </div>
    </MainLayout>
  )
}

