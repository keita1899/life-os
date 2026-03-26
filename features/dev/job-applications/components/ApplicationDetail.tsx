'use client'

import type { ReactElement } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Check, ExternalLink } from 'lucide-react'
import type {
  JobApplication,
  ApplicationStatus,
} from '../types/job-application'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '../types/job-application'

interface ApplicationDetailProps {
  application: JobApplication
  onStatusChange: (status: ApplicationStatus) => void
}

function formatDate(date: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ApplicationDetail({
  application,
  onStatusChange,
}: ApplicationDetailProps): ReactElement {
  return (
    <section>
      <div className="border-b border-stone-200 py-4 dark:border-stone-800">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              ステータス
            </dt>
            <dd className="mt-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Badge
                      className={
                        APPLICATION_STATUS_COLORS[application.status]
                      }
                    >
                      {APPLICATION_STATUS_LABELS[application.status]}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(
                    Object.entries(APPLICATION_STATUS_LABELS) as [
                      ApplicationStatus,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => onStatusChange(value)}
                    >
                      <span className="flex items-center gap-2">
                        {application.status === value ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="h-3.5 w-3.5" />
                        )}
                        <Badge
                          className={APPLICATION_STATUS_COLORS[value]}
                        >
                          {label}
                        </Badge>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              応募日
            </dt>
            <dd className="mt-1 text-sm">
              {formatDate(application.appliedDate) ?? '未設定'}
            </dd>
          </div>
        </dl>

        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              求人URL
            </dt>
            <dd className="mt-1 text-sm">
              {application.url ? (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                >
                  リンク
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">未設定</span>
              )}
            </dd>
          </div>
        </dl>

        {application.notes && (
          <div className="mt-4">
            <dt className="text-xs font-medium text-muted-foreground">
              メモ
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm">
              {application.notes}
            </dd>
          </div>
        )}
      </div>
    </section>
  )
}
