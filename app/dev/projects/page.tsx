'use client'

import { useState } from 'react'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ProjectCreationWizard,
  ProjectList,
  useDevProjects,
} from '@/features/dev/projects'
import { upsertProjectRequirements } from '@/features/dev/requirements'
import { Loading } from '@/components/ui/loading'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { ErrorMessage } from '@/components/ui/error-message'
import type { CreateDevProjectInput, DevProject } from '@/features/dev/projects'

export default function DevProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
  } = useDevProjects()
  const [wizardOpen, setWizardOpen] = useState(false)
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'unreleased' | 'released'
  >('all')

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all' || value === 'unreleased' || value === 'released') {
      setStatusFilter(value)
    }
  }

  useCreateShortcut({
    onCreate: () => setWizardOpen(true),
    enabled: !wizardOpen,
  })

  const handleRenameProject = async (project: DevProject, name: string) => {
    await execute(
      () => updateProject(project.id, { name }),
      'プロジェクト名の更新に失敗しました',
    )
  }

  const handleCreateProject = async (
    input: CreateDevProjectInput,
    requirementsContent: string,
  ): Promise<void> => {
    const project = await createProject(input)
    await upsertProjectRequirements(project.id, requirementsContent)
    setWizardOpen(false)
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
            <CreateButton
              label="プロジェクトを作成"
              onClick={() => setWizardOpen(true)}
              title="⌘N で作成"
            />
          </div>
        </div>

        <ErrorMessage
          message={operationError || error || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        {isLoading ? (
          <Loading />
        ) : (
          <ProjectList
            projects={projects}
            statusFilter={statusFilter}
            onRename={handleRenameProject}
          />
        )}

        <ProjectCreationWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSubmit={handleCreateProject}
        />
      </div>
    </>
  )
}
