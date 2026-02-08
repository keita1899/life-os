import { useState, useCallback } from 'react'

export function useAsyncOperation() {
  const [operationError, setOperationError] = useState<string | null>(null)

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T | undefined> => {
    try {
      setOperationError(null)
      return await operation()
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : errorMessage,
      )
      return undefined
    }
  }, [])

  return {
    operationError,
    setOperationError,
    execute,
  }
}
