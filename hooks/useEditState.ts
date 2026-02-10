import { useState, useCallback } from 'react'

export function useEditState() {
  const [editingId, setEditingId] = useState<number | null>(null)

  const startEdit = useCallback((id: number) => {
    setEditingId(id)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const isEditing = useCallback(
    (id: number) => editingId === id,
    [editingId],
  )

  return {
    editingId,
    startEdit,
    cancelEdit,
    isEditing,
  }
}
