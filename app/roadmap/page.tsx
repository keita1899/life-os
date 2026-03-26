'use client'

import { useState, useMemo, useEffect } from 'react'
import { Loading } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import {
  RoadmapProjectSidebar,
  RoadmapProjectView,
  useRoadmapProjects,
} from '@/features/roadmap'

export default function RoadmapPage() {
  const { projects, isLoading } = useRoadmapProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // 初期選択: 最初のプロジェクト
  useEffect(() => {
    if (!isLoading && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id.toString())
    }
  }, [isLoading, projects, selectedProjectId])

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null
    return projects.find((p) => p.id.toString() === selectedProjectId) ?? null
  }, [selectedProjectId, projects])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] self-start">
        <RoadmapProjectSidebar
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-8">
          {isLoading ? (
            <Loading />
          ) : projects.length === 0 ? (
            <EmptyState message="プロジェクトを作成してください" />
          ) : selectedProject ? (
            <RoadmapProjectView
              projectId={selectedProject.id}
              projectName={selectedProject.name}
            />
          ) : (
            <EmptyState message="プロジェクトを選択してください" />
          )}
        </div>
      </div>
    </div>
  )
}
