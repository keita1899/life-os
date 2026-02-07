import { useHotkeys } from 'react-hotkeys-hook'
import type { UseFormReturn, FieldValues } from 'react-hook-form'

interface UseFormSubmitShortcutOptions<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void | Promise<void>
  enabled?: boolean
}

export function useFormSubmitShortcut<T extends FieldValues = FieldValues>({
  form,
  onSubmit,
  enabled = true,
}: UseFormSubmitShortcutOptions<T>) {
  useHotkeys(
    'mod+enter',
    () => {
      if (enabled) {
        form.handleSubmit(onSubmit)()
      }
    },
    { enableOnFormTags: true, preventDefault: true },
    [form, onSubmit, enabled],
  )
}
