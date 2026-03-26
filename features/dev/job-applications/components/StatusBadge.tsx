'use client'

import { Badge } from '@/components/ui/badge'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '../types/job-application'
import type { ApplicationStatus } from '../types/job-application'

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={APPLICATION_STATUS_COLORS[status]}>
      {APPLICATION_STATUS_LABELS[status]}
    </Badge>
  )
}
