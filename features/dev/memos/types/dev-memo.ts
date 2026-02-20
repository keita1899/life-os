export interface DevMemo {
  id: number
  content: string
  projectId: number | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDevMemoInput {
  content: string
  projectId?: number | null
  tags?: string[]
}

export interface UpdateDevMemoInput {
  content?: string
  projectId?: number | null
  tags?: string[]
}
