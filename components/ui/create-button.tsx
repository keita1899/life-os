import { Plus } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'

interface CreateButtonProps extends Omit<ButtonProps, 'children'> {
  label: string
}

export function CreateButton({ label, ...props }: CreateButtonProps) {
  return (
    <Button {...props}>
      <Plus className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
