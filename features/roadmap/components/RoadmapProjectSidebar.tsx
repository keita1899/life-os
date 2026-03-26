'use client'

import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useRoadmapProjects } from '../hooks/useRoadmapProjects'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useEditState } from '@/hooks/useEditState'
import type { RoadmapProject } from '../types/roadmap-project'
import { RoadmapProjectList } from './RoadmapProjectList'

interface RoadmapProjectSidebarProps {
  selectedProjectId: string
  onSelectProject: (projectId: string) => void
}

export function RoadmapProjectSidebar({
  selectedProjectId,
  onSelectProject,
}: RoadmapProjectSidebarProps) {
  const {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
  } = useRoadmapProjects()
  const editState = useEditState()
  const { operationError, execute } = useAsyncOperation()

  const handleCreateProject = async (name: string) => {
    const result = await execute(
      () => createProject({ name }),
      'プロジェクトの作成に失敗しました',
    )
    if (result !== undefined) {
      onSelectProject(result.id.toString())
    }
  }

  const handleUpdateProject = async (id: number, name: string) => {
    const result = await execute(
      () => updateProject(id, { name }),
      'プロジェクトの更新に失敗しました',
    )
    if (result !== undefined) {
      editState.cancelEdit()
    }
  }

  const handleDeleteProject = async (project: RoadmapProject) => {
    const projectIdStr = project.id.toString()
    const result = await execute(
      () => deleteProject(project.id),
      'プロジェクトの削除に失敗しました',
    )
    if (result !== undefined && selectedProjectId === projectIdStr) {
      const remaining = projects.filter((p) => p.id !== project.id)
      onSelectProject(remaining.length > 0 ? remaining[0].id.toString() : '')
    }
  }

  if (isLoading) {
    return (
      <div className="h-full w-64 border-r border-stone-200/60 bg-stone-900/10 p-4 text-foreground dark:border-stone-700/40 dark:bg-stone-900/20">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-stone-200/60 bg-stone-900/10 text-foreground dark:border-stone-700/40 dark:bg-stone-900/20 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-lg font-semibold">ロードマップ</h2>

        <ErrorMessage message={error || operationError || ''} />

        <RoadmapProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          editState={editState}
          onSelectProject={onSelectProject}
          onDelete={handleDeleteProject}
          onUpdateProject={handleUpdateProject}
          onCreateProject={handleCreateProject}
          onReorder={reorderProjects}
        />
      </div>
    </div>
  )
}
