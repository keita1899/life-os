'use client'

import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import type { JobApplication } from '../types/job-application'
import type { JobInterview } from '../types/job-interview'

interface ApplicationCardProps {
  application: JobApplication
  nextInterview?: JobInterview | null
}

function formatSchedule(interview: JobInterview): string {
  const parts: string[] = []
  if (interview.scheduledDate) {
    const date = new Date(interview.scheduledDate)
    parts.push(
      `${date.getMonth() + 1}/${date.getDate()}`,
    )
  }
  if (interview.scheduledTime) {
    parts.push(interview.scheduledTime)
  }
  return parts.join(' ')
}

export function ApplicationCard({
  application,
  nextInterview,
}: ApplicationCardProps) {
  return (
    <Link
      href={`/dev/applications/detail?id=${application.id}`}
      className="block w-full rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="min-w-0 break-words text-lg font-semibold line-clamp-1">
            {application.companyName}
          </h3>
          {nextInterview && (
            <div className="mt-1 text-sm text-muted-foreground">
              <span className="text-purple-600 dark:text-purple-400">
                次: {formatSchedule(nextInterview)}
              </span>
            </div>
          )}
        </div>
        <StatusBadge status={application.status} />
      </div>
    </Link>
  )
}
