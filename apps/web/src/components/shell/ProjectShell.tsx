import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { ShellFrame } from './ShellFrame'
import { ProjectNav } from './ProjectNav'
import { ProjectSwitcher } from '@/features/workspace/components/ProjectSwitcher'
import { Button } from '@/components/ui/button'
import { SidebarMenuItem } from '@/components/ui/sidebar'

const PROJECT_ROUTE_KEYS: Record<string, string> = {
  releases: 'nav.releases',
  features: 'nav.features',
  flags: 'nav.flags',
  'repo-ops': 'nav.repoOps',
  settings: 'nav.settings',
}

export function ProjectShell() {
  const { t } = useTranslation('common')
  const params = useParams<{ organizationId: string }>()
  const organizationId = params.organizationId!
  const location = useLocation()
  const navigate = useNavigate()
  const { activeProject } = useProject()

  const segments = location.pathname.split('/').filter(Boolean)
  const section = segments[2] ?? ''
  const sectionLabel = t(PROJECT_ROUTE_KEYS[section] ?? 'nav.releases')
  const fallbackTitle = activeProject ? `${activeProject.name} · ${sectionLabel}` : sectionLabel

  return (
    <ShellFrame
      sidebarHeader={
        <>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(generatePath(ROUTES.ORG_ROOT, { organizationId }))}
              aria-label={t('nav.backToOrganization')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t('nav.backToOrganization')}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ProjectSwitcher />
          </SidebarMenuItem>
        </>
      }
      nav={<ProjectNav />}
      fallbackTitle={fallbackTitle}
    />
  )
}
