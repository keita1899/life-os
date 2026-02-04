'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex h-5 w-5 items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className={cn(
            'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-stone-300 bg-white transition-colors checked:border-primary checked:bg-primary dark:border-stone-600 dark:bg-stone-900',
            className,
          )}
          {...props}
        />
        {checked && (
          <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white" />
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
