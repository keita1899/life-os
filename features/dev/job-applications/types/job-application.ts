export type ApplicationStatus =
  | 'interested'
  | 'applied'
  | 'document_screening'
  | 'interview'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export interface JobApplication {
  id: number
  companyName: string
  status: ApplicationStatus
  url: string | null
  appliedDate: string | null
  notes: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateJobApplicationInput {
  companyName: string
  status?: ApplicationStatus
  url?: string | null
  appliedDate?: string | null
  notes?: string | null
}

export interface UpdateJobApplicationInput {
  companyName?: string
  status?: ApplicationStatus
  url?: string | null
  appliedDate?: string | null
  notes?: string | null
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: '興味あり',
  applied: '応募済み',
  document_screening: '書類選考中',
  interview: '面接中',
  offer: '内定',
  accepted: '内定承諾',
  rejected: '不合格',
  withdrawn: '辞退',
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  interested:
    'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  document_screening:
    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  interview:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  offer:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  accepted:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  withdrawn:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

/** 選考中のステータス */
export const ACTIVE_STATUSES: ApplicationStatus[] = [
  'interested',
  'applied',
  'document_screening',
  'interview',
  'offer',
]

/** 終了済みのステータス */
export const CLOSED_STATUSES: ApplicationStatus[] = [
  'accepted',
  'rejected',
  'withdrawn',
]
