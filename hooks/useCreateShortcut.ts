import { useHotkeys } from 'react-hotkeys-hook'

interface UseCreateShortcutOptions {
  onCreate: () => void
  enabled?: boolean
}

export function useCreateShortcut({
  onCreate,
  enabled = true,
}: UseCreateShortcutOptions) {
  useHotkeys(
    'mod+n',
    (e) => {
      if (enabled) {
        e.preventDefault()
        onCreate()
      }
    },
    { enableOnFormTags: false, preventDefault: true },
    [onCreate, enabled],
  )
}
