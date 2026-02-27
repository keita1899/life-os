export interface DevMemo {
  id: number
  title: string | null
  content: string
  projectId: number | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDevMemoInput {
  title?: string | null
  content: string
  projectId?: number | null
  tags?: string[]
}

export interface UpdateDevMemoInput {
  title?: string | null
  content?: string
  projectId?: number | null
  tags?: string[]
}
