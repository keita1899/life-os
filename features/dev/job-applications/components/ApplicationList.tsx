'use client'

import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { ApplicationCard } from './ApplicationCard'
import type { JobApplication, ApplicationStatus } from '../types/job-application'
import {
  APPLICATION_STATUS_LABELS,
  ACTIVE_STATUSES,
  CLOSED_STATUSES,
} from '../types/job-application'
import type { JobInterview } from '../types/job-interview'

type ListFilter = 'all' | 'active' | 'closed'

interface ApplicationListProps {
  applications: JobApplication[]
  filter?: ListFilter
  nextInterviewMap?: Map<number, JobInterview>
}

/** ステータスの表示順序 */
const STATUS_ORDER: ApplicationStatus[] = [
  'interview',
  'document_screening',
  'applied',
  'offer',
  'interested',
  'accepted',
  'rejected',
  'withdrawn',
]

export function ApplicationList({
  applications,
  filter = 'all',
  nextInterviewMap,
}: ApplicationListProps): ReactElement {
  const filteredApplications = useMemo(() => {
    if (filter === 'all') return applications
    if (filter === 'active') {
      return applications.filter((a) =>
        ACTIVE_STATUSES.includes(a.status),
      )
    }
    return applications.filter((a) => CLOSED_STATUSES.includes(a.status))
  }, [applications, filter])

  const groupedApplications = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      status,
      title: APPLICATION_STATUS_LABELS[status],
      items: filteredApplications.filter((a) => a.status === status),
    })).filter((group) => group.items.length > 0)
  }, [filteredApplications])

  if (filteredApplications.length === 0) {
    return (
      <EmptyState
        message={
          filter === 'all'
            ? '応募がありません'
            : filter === 'active'
              ? '選考中の応募がありません'
              : '終了済みの応募がありません'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {groupedApplications.map((group) => (
        <div key={group.status}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {group.title}
          </h2>
          <div className="flex flex-col gap-3">
            {group.items.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                nextInterview={nextInterviewMap?.get(application.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
