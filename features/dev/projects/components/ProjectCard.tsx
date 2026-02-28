'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import type { DevProject, ProjectStatus } from '../types/dev-project'

interface ProjectCardProps {
  project: DevProject
  onRename?: (project: DevProject, name: string) => Promise<void>
}

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

export function ProjectCard({ project, onRename }: ProjectCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const startDate = formatDate(project.startDate)
  const endDate = formatDate(project.endDate)

  return (
    <Link
      href={`/dev/projects/project?id=${project.id}`}
      className="block w-full rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="min-w-0 break-words text-lg font-semibold line-clamp-2">
              <InlineEditableText
                value={project.name}
                onSave={(name) => onRename!(project, name)}
                disabled={!onRename}
              />
            </h3>
          </div>
          {(startDate || endDate) && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {startDate && <span>開始: {startDate}</span>}
              {endDate && <span>期限: {endDate}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusColors[project.status]} aria-label="ステータス">
            {statusLabels[project.status]}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
