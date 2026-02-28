'use client'

import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { ProjectCard } from './ProjectCard'
import type { DevProject } from '../types/dev-project'

interface ProjectListProps {
  projects: DevProject[]
  statusFilter?: 'all' | 'unreleased' | 'released'
  onRename?: (project: DevProject, name: string) => Promise<void>
}

export function ProjectList({
  projects,
  statusFilter = 'all',
  onRename,
}: ProjectListProps): ReactElement {
  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') {
      return projects
    }
    if (statusFilter === 'unreleased') {
      return projects.filter(
        (p) => p.status === 'draft' || p.status === 'in_progress',
      )
    }
    return projects.filter((p) => p.status === 'released')
  }, [projects, statusFilter])

  const groupedProjects = useMemo(() => {
    const draft = filteredProjects.filter((p) => p.status === 'draft')
    const inProgress = filteredProjects.filter((p) => p.status === 'in_progress')
    const released = filteredProjects.filter((p) => p.status === 'released')

    return [
      { key: 'in_progress', title: '進行中', items: inProgress },
      { key: 'draft', title: '下書き', items: draft },
      { key: 'released', title: 'リリース済み', items: released },
    ].filter((group) => group.items.length > 0)
  }, [filteredProjects])

  if (filteredProjects.length === 0) {
    return (
      <EmptyState
        message={
          statusFilter === 'all'
            ? 'プロジェクトがありません'
            : statusFilter === 'unreleased'
              ? '未リリースのプロジェクトがありません'
              : 'リリース済みのプロジェクトがありません'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {groupedProjects.map((group) => (
        <div key={group.key}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {group.title}
          </h2>
          <div className="flex flex-col gap-4">
            {group.items.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRename={onRename}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
