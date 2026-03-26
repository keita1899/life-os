export type InterviewType =
  | 'casual'
  | 'interview'
  | 'technical'
  | 'final'
  | 'other'

export type InterviewResult = 'pending' | 'passed' | 'failed' | 'cancelled'

export interface JobInterview {
  id: number
  applicationId: number
  round: number
  interviewType: InterviewType
  scheduledDate: string | null
  scheduledTime: string | null
  location: string | null
  notes: string | null
  result: InterviewResult | null
  createdAt: string
  updatedAt: string
}

export interface CreateJobInterviewInput {
  applicationId: number
  round?: number
  interviewType?: InterviewType
  scheduledDate?: string | null
  scheduledTime?: string | null
  location?: string | null
  notes?: string | null
  result?: InterviewResult | null
}

export interface UpdateJobInterviewInput {
  round?: number
  interviewType?: InterviewType
  scheduledDate?: string | null
  scheduledTime?: string | null
  location?: string | null
  notes?: string | null
  result?: InterviewResult | null
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  casual: 'カジュアル面談',
  interview: '面接',
  technical: '技術面接',
  final: '最終面接',
  other: 'その他',
}

export const INTERVIEW_RESULT_LABELS: Record<InterviewResult, string> = {
  pending: '未定',
  passed: '通過',
  failed: '不合格',
  cancelled: 'キャンセル',
}

export const INTERVIEW_RESULT_COLORS: Record<InterviewResult, string> = {
  pending:
    'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  passed:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}
