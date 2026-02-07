'use client'

interface EmptyStateProps {
  message: string
  children?: React.ReactNode
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <>
      <p className="text-center text-sm text-muted-foreground">{message}</p>
      {children}
    </>
  )
}
