import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, Check, FolderOpen, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useProject } from '@/context/project.context'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/lib/routes'

export function ProjectSwitcher() {
  const { t } = useTranslation('workspace')
  const { projects, activeProject, setActiveProjectId, loading } = useProject()
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-1">
        <Skeleton className="size-8 rounded-lg" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-2.5 w-32 rounded" />
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted">
          <FolderOpen className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">
            {t('projectSwitcher.noProjects')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className={cn(
              'rounded-xl border border-transparent',
              'transition-all duration-200',
              'hover:border-border/60 hover:shadow-glow-sm',
              'data-[state=open]:border-border/60 data-[state=open]:shadow-glow-sm',
            )}
            aria-label={t('projectSwitcher.label')}
          />
        }
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FolderOpen className="size-4" aria-hidden />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold text-foreground">
            {activeProject?.name}
          </span>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {activeProject?.repo}
          </span>
        </div>
        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-64 rounded-xl border border-border/60 bg-popover/90 backdrop-blur-md"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
            {t('projectSwitcher.label')}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {projects.map((project, index) => {
          const isActive = project.id === activeProject?.id
          return (
            <motion.div
              key={project.id}
              initial={reducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.18 }}
            >
              <DropdownMenuItem
                className={cn(
                  'rounded-lg px-2 py-2 cursor-pointer',
                  isActive && 'bg-accent',
                )}
                onClick={() => setActiveProjectId(project.id)}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>
                    {project.name}
                  </span>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {project.repo}
                  </span>
                </div>
                {isActive && (
                  <Check
                    className="ml-2 size-4 shrink-0 text-primary"
                    aria-label={t('projectSwitcher.active')}
                  />
                )}
              </DropdownMenuItem>
            </motion.div>
          )
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg px-2 py-2 cursor-pointer gap-2"
          onClick={() => navigate(ROUTES.PROJECT_CREATE)}
        >
          <Plus className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">{t('projectSwitcher.createProject')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
