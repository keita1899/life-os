import type { ChecklistItem } from '@/lib/types/checklist-item'

export function calculateProgress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0
  const completed = checklist.filter((item) => item.completed).length
  return Math.round((completed / checklist.length) * 100)
}
