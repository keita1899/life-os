'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDevProjects } from '@/hooks/useDevProjects'
import { ProjectDialog } from '@/components/dev/projects/ProjectDialog'
import { ProjectList } from '@/components/dev/projects/ProjectList'
import { Loading } from '@/components/ui/loading'
import type { CreateDevProjectInput } from '@/lib/types/dev-project'

export default function DevProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    createProject,
  } = useDevProjects()
  const {
    isDialogOpen,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<never>()
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'unreleased' | 'released'
  >('all')

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all' || value === 'unreleased' || value === 'released') {
      setStatusFilter(value)
    }
  }

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  const handleCreateProject = async (
    input: CreateDevProjectInput,
  ): Promise<void> => {
    await createProject(input)
    handleDialogClose(false)
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">プロジェクト</h1>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="フィルター" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="unreleased">未リリース</SelectItem>
                <SelectItem value="released">リリース済み</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreateClick} title="⌘N で作成">
              <Plus className="mr-2 h-4 w-4" />
              プロジェクトを作成
            </Button>
          </div>
        </div>

        {error && <div className="mb-4"><span className="text-destructive">{error}</span></div>}

        {isLoading ? (
          <Loading />
        ) : (
          <ProjectList
            projects={projects}
            statusFilter={statusFilter}
          />
        )}

        <ProjectDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={handleCreateProject}
        />
      </div>
    </>
  )
}
