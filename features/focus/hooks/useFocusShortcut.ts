import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'

interface UseFocusShortcutOptions {
  path: string
}

export function useFocusShortcut({ path }: UseFocusShortcutOptions) {
  const router = useRouter()
  useHotkeys(
    'mod+f',
    () => router.push(path),
    { enableOnFormTags: false, preventDefault: true },
    [router, path],
  )
}
