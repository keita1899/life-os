export function formatShortcutKey(): string {
  if (typeof window === 'undefined') {
    return '⌘↵'
  }

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac ? '⌘↵' : 'Ctrl+Enter'
}

export function formatSubmitLabelWithShortcut(label: string): string {
  return `${label} (${formatShortcutKey()})`
}
