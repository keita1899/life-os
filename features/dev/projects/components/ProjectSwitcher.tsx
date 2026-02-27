'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { useDevProjects } from '@/features/dev/projects'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { ProjectStatus } from '@/features/dev/projects'

const RECENT_PROJECTS_KEY = 'recent-project-ids'
const MAX_RECENT = 5

const statusIcons: Record<ProjectStatus, string> = {
  draft: '📝',
  in_progress: '🚀',
  released: '✅',
}

function getRecentProjectIds(): number[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as number[]
  } catch {
    return []
  }
}

function addRecentProjectId(id: number): void {
  const ids = getRecentProjectIds().filter((v) => v !== id)
  ids.unshift(id)
  try {
    localStorage.setItem(
      RECENT_PROJECTS_KEY,
      JSON.stringify(ids.slice(0, MAX_RECENT)),
    )
  } catch {
    // localStorage access failed, ignore safely
  }
}

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { projects } = useDevProjects()

  // open が変わるたびに localStorage から読み直す
  const recentIds = useMemo(() => (open ? getRecentProjectIds() : []), [open])

  useHotkeys(
    'mod+p',
    () => setOpen((prev) => !prev),
    { enableOnFormTags: open, preventDefault: true },
    [open],
  )

  const handleSelect = useCallback(
    (projectId: string) => {
      addRecentProjectId(Number(projectId))
      setOpen(false)
      router.push(`/dev/projects/project?id=${projectId}`)
    },
    [router],
  )

  const recentProjects = recentIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p) => p != null)

  const recentIdSet = new Set(recentIds)
  const activeProjects = projects.filter((p) => p.status === 'in_progress' && !recentIdSet.has(p.id))
  const draftProjects = projects.filter((p) => p.status === 'draft' && !recentIdSet.has(p.id))
  const releasedProjects = projects.filter((p) => p.status === 'released' && !recentIdSet.has(p.id))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="プロジェクトを検索..." />
      <CommandList>
        <CommandEmpty>プロジェクトが見つかりません</CommandEmpty>
        {recentProjects.length > 0 && (
          <CommandGroup heading="最近">
            {recentProjects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => handleSelect(String(project.id))}
              >
                <span className="mr-2">{statusIcons[project.status]}</span>
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {activeProjects.length > 0 && (
          <CommandGroup heading="進行中">
            {activeProjects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => handleSelect(String(project.id))}
              >
                <span className="mr-2">{statusIcons.in_progress}</span>
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {draftProjects.length > 0 && (
          <CommandGroup heading="下書き">
            {draftProjects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => handleSelect(String(project.id))}
              >
                <span className="mr-2">{statusIcons.draft}</span>
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {releasedProjects.length > 0 && (
          <CommandGroup heading="リリース済み">
            {releasedProjects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => handleSelect(String(project.id))}
              >
                <span className="mr-2">{statusIcons.released}</span>
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
