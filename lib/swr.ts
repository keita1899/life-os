export type Fetcher<T> = () => Promise<T>

export async function fetcher<T>(fn: Fetcher<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

