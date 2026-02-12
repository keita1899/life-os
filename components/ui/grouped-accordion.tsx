'use client'

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface GroupedAccordionItem {
  key: string
  trigger: React.ReactNode
  content: React.ReactNode
  itemClassName?: string
  triggerClassName?: string
  contentClassName?: string
}

interface GroupedAccordionProps {
  items: GroupedAccordionItem[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  defaultValue?: string[]
  className?: string
}

export function GroupedAccordion({
  items,
  value,
  onValueChange,
  defaultValue,
  className,
}: GroupedAccordionProps) {
  const accordionProps =
    value !== undefined && onValueChange !== undefined
      ? { value, onValueChange }
      : { defaultValue }

  return (
    <Accordion
      type="multiple"
      className={cn('w-full', className)}
      {...accordionProps}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.key}
          value={item.key}
          className={item.itemClassName}
        >
          <AccordionHeader>
            <AccordionTrigger
              className={cn('hover:no-underline', item.triggerClassName)}
            >
              {item.trigger}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent className={item.contentClassName}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
