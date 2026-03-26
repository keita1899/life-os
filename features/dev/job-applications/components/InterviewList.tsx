'use client'

import type { ReactElement } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { JobInterview } from '../types/job-interview'
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_RESULT_COLORS,
} from '../types/job-interview'
import type { InterviewResult } from '../types/job-interview'

interface InterviewListProps {
  interviews: JobInterview[]
  onEdit: (interview: JobInterview) => void
  onDelete: (interview: JobInterview) => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function InterviewList({
  interviews,
  onEdit,
  onDelete,
}: InterviewListProps): ReactElement {
  if (interviews.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        面接がありません
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800">
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
              回
            </th>
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
              種別
            </th>
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
              日時
            </th>
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
              結果
            </th>
            <th className="py-2 text-right font-medium text-muted-foreground">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((interview) => (
            <tr
              key={interview.id}
              className="border-b border-stone-100 dark:border-stone-800/50"
            >
              <td className="py-2 pr-4">{interview.round}次</td>
              <td className="py-2 pr-4">
                {INTERVIEW_TYPE_LABELS[interview.interviewType]}
              </td>
              <td className="py-2 pr-4">
                {formatDate(interview.scheduledDate)}
                {interview.scheduledTime && ` ${interview.scheduledTime}`}
              </td>
              <td className="py-2 pr-4">
                {interview.result ? (
                  <Badge
                    className={
                      INTERVIEW_RESULT_COLORS[
                        interview.result as InterviewResult
                      ]
                    }
                  >
                    {
                      INTERVIEW_RESULT_LABELS[
                        interview.result as InterviewResult
                      ]
                    }
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(interview)}
                    aria-label="編集"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(interview)}
                    aria-label="削除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
