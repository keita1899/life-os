import {
  type LucideIcon,
  Home,
  Target,
  CheckSquare,
  Calendar,
  ListChecks,
  ShoppingBag,
  CreditCard,
  FolderKanban,
  Eye,
  Wallet,
  Repeat,
  Settings,
} from 'lucide-react'

export interface SidebarItemData {
  href: string
  icon: LucideIcon
  title: string
  hoverIcon: string
  activeIcon: string
}

export function getActiveHref(pathname: string, hrefs: string[]): string | null {
  const path = pathname?.split('?')[0] ?? ''

  return (
    [...hrefs]
      .sort((a, b) => b.length - a.length)
      .find((href) =>
        path === href || (href !== '/' && path.startsWith(`${href}/`)),
      ) ?? null
  )
}

export const HOME_ITEM: SidebarItemData = {
  href: '/',
  icon: Home,
  title: 'ホーム',
  hoverIcon:
    'group-hover:bg-stone-200 group-hover:text-stone-800 dark:group-hover:bg-stone-700 dark:group-hover:text-stone-200',
  activeIcon:
    'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
}

export const TASK_ITEMS: SidebarItemData[] = [
  {
    href: '/goals',
    icon: Target,
    title: '目標',
    hoverIcon:
      'group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400',
    activeIcon:
      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    href: '/events',
    icon: Calendar,
    title: '予定',
    hoverIcon:
      'group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-900/30 dark:group-hover:text-purple-400',
    activeIcon:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/tasks',
    icon: CheckSquare,
    title: 'タスク',
    hoverIcon:
      'group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400',
    activeIcon:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    href: '/habits',
    icon: Repeat,
    title: '習慣',
    hoverIcon:
      'group-hover:bg-teal-100 group-hover:text-teal-600 dark:group-hover:bg-teal-900/30 dark:group-hover:text-teal-400',
    activeIcon:
      'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  },
]

export const FINANCE_ITEMS: SidebarItemData[] = [
  {
    href: '/kakeibo',
    icon: Wallet,
    title: '家計簿',
    hoverIcon:
      'group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400',
    activeIcon:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    href: '/subscriptions',
    icon: CreditCard,
    title: 'サブスク',
    hoverIcon:
      'group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400',
    activeIcon:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
]

export const LIST_ITEMS: SidebarItemData[] = [
  {
    href: '/bucket-list',
    icon: ListChecks,
    title: 'やりたいことリスト',
    hoverIcon:
      'group-hover:bg-orange-100 group-hover:text-orange-600 dark:group-hover:bg-orange-900/30 dark:group-hover:text-orange-400',
    activeIcon:
      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    href: '/wishlist',
    icon: ShoppingBag,
    title: '欲しいものリスト',
    hoverIcon:
      'group-hover:bg-pink-100 group-hover:text-pink-600 dark:group-hover:bg-pink-900/30 dark:group-hover:text-pink-400',
    activeIcon:
      'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  },
  {
    href: '/vision',
    icon: Eye,
    title: 'ビジョン',
    hoverIcon:
      'group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400',
    activeIcon:
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
]

export const SETTINGS_ITEM: SidebarItemData = {
  href: '/settings',
  icon: Settings,
  title: '設定',
  hoverIcon:
    'group-hover:bg-stone-200 group-hover:text-stone-800 dark:group-hover:bg-stone-700 dark:group-hover:text-stone-200',
  activeIcon:
    'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
}

export const DEV_TASK_ITEMS: SidebarItemData[] = [
  {
    href: '/dev/goals',
    icon: Target,
    title: '目標',
    hoverIcon:
      'group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400',
    activeIcon:
      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    href: '/dev/projects',
    icon: FolderKanban,
    title: 'プロジェクト',
    hoverIcon:
      'group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-900/30 dark:group-hover:text-purple-400',
    activeIcon:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    href: '/dev/tasks',
    icon: CheckSquare,
    title: 'タスク',
    hoverIcon:
      'group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400',
    activeIcon:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
]
