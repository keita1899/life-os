export const MEMO_CATEGORIES = [
  { value: 'memo', label: 'メモ' },
  { value: 'implementation', label: '実装方法' },
  { value: 'error', label: 'エラー' },
  { value: 'review', label: 'レビュー' },
  { value: 'template', label: 'テンプレート' },
  { value: 'snippet', label: 'スニペット' },
  { value: 'prompt', label: 'プロンプト' },
  { value: 'ai_answer', label: 'AI回答' },
] as const

export const MEMO_CATEGORY_LABEL_MAP: Record<string, string> =
  Object.fromEntries(MEMO_CATEGORIES.map((c) => [c.value, c.label]))
