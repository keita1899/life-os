export type ReviewMode = 'life' | 'development'

export type ReviewType =
  | 'morning'
  | 'evening'
  | 'week_start'
  | 'week_end'
  | 'month_start'
  | 'month_end'
  | 'year_start'
  | 'year_end'

export type ReviewWizardType = Extract<
  ReviewType,
  | 'morning'
  | 'evening'
  | 'week_start'
  | 'week_end'
  | 'month_start'
  | 'month_end'
  | 'year_start'
  | 'year_end'
>

export interface ReviewCompletion {
  id: number
  completedDate: string
  type: ReviewType
  mode: ReviewMode
  completedAt: string
}
