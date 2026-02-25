'use client'

import { useCallback, useState } from 'react'
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

const statusIcons: Record<ProjectStatus, string> = {
  draft: '📝',
  in_progress: '🚀',
  released: '✅',
}

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { projects } = useDevProjects()

  useHotkeys(
    'mod+p',
    () => setOpen((prev) => !prev),
    { enableOnFormTags: open, preventDefault: true },
    [open],
  )

  const handleSelect = useCallback(
    (projectId: string) => {
      setOpen(false)
      router.push(`/dev/projects/project?id=${projectId}`)
    },
    [router],
  )

  const activeProjects = projects.filter((p) => p.status === 'in_progress')
  const draftProjects = projects.filter((p) => p.status === 'draft')
  const releasedProjects = projects.filter((p) => p.status === 'released')

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="プロジェクトを検索..." />
      <CommandList>
        <CommandEmpty>プロジェクトが見つかりません</CommandEmpty>
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
