import * as React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { cn } from '@/lib/utils'

type AutoResizeTextareaProps = React.ComponentProps<typeof TextareaAutosize>

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, minRows = 3, ...props }, ref) => {
  return (
    <TextareaAutosize
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none',
        className
      )}
      minRows={minRows}
      {...props}
    />
  )
})
AutoResizeTextarea.displayName = 'AutoResizeTextarea'

export { AutoResizeTextarea }
