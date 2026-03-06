export interface DevMemo {
  id: number
  title: string | null
  content: string
  projectId: number | null
  tags: string[]
  category: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDevMemoInput {
  title?: string | null
  content: string
  projectId?: number | null
  tags?: string[]
  category?: string | null
}

export interface UpdateDevMemoInput {
  title?: string | null
  content?: string
  projectId?: number | null
  tags?: string[]
  category?: string | null
}
