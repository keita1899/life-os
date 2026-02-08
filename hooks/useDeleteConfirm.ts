import { useState, useCallback } from 'react'

export function useDeleteConfirm<T>() {
  const [deletingItem, setDeletingItem] = useState<T | undefined>(undefined)

  const handleDeleteClick = useCallback((item: T) => {
    setDeletingItem(item)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeletingItem(undefined)
  }, [])

  const clearDeletingItem = useCallback(() => {
    setDeletingItem(undefined)
  }, [])

  return {
    deletingItem,
    handleDeleteClick,
    handleDeleteCancel,
    clearDeletingItem,
  }
}
