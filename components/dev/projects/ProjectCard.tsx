'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { DevProject, ProjectStatus } from '@/lib/types/dev-project'

interface ProjectCardProps {
  project: DevProject
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

export function ProjectCard({ project }: ProjectCardProps) {
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
    <div className="w-full rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <Link
          href={`/dev/projects/project?id=${project.id}`}
          className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="mb-2 flex items-center gap-2">
            <h3 className="min-w-0 break-words text-lg font-semibold line-clamp-2">
              {project.name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {startDate && <span>開始: {startDate}</span>}
            {endDate && <span>期限: {endDate}</span>}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Badge className={statusColors[project.status]} aria-label="ステータス">
            {statusLabels[project.status]}
          </Badge>
        </div>
      </div>
    </div>
  )
}
