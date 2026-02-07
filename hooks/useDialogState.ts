import { useState, useCallback } from 'react'

export function useDialogState<T>() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | undefined>(undefined)

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }, [])

  const handleDialogClose = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingItem(undefined)
    }
  }, [])

  const handleCreateClick = useCallback(() => {
    setEditingItem(undefined)
    setIsDialogOpen(true)
  }, [])

  return {
    isDialogOpen,
    editingItem,
    handleEdit,
    handleDialogClose,
    handleCreateClick,
  }
}
