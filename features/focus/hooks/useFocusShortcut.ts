import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { useFocusSessionActive } from '@/hooks/useFocusSessionActive'

interface UseFocusShortcutOptions {
  path: string
}

export function useFocusShortcut({ path }: UseFocusShortcutOptions) {
  const router = useRouter()
  const { isActive } = useFocusSessionActive()
  useHotkeys(
    'mod+f',
    () => router.push(path),
    { enableOnFormTags: false, preventDefault: true, enabled: !isActive },
    [router, path, isActive],
  )
}
