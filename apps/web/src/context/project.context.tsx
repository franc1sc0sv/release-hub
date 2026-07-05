import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { Navigate, generatePath, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { LIST_PROJECTS } from '@/features/workspace/graphql/workspace.queries'
import { useOrganization } from '@/context/organization.context'
import { ROUTES } from '@/lib/routes'
import type { ListProjectsQuery } from '@/generated/graphql'

type ProjectItem = ListProjectsQuery['listProjects'][number]

interface ProjectContextValue {
  projects: ProjectItem[]
  activeProject: ProjectItem | null
  loading: boolean
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const params = useParams<{ organizationId: string; projectId: string }>()
  const organizationId = params.organizationId!
  const projectId = params.projectId
  const location = useLocation()
  const { activeOrg, setActiveOrgId } = useOrganization()
  const { data, loading } = useQuery(LIST_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  })

  const allProjects: ProjectItem[] = data?.listProjects ?? []

  const activeProject = useMemo(
    () => allProjects.find((p) => p.id === projectId) ?? null,
    [allProjects, projectId],
  )

  useEffect(() => {
    if (activeProject && activeProject.organizationId !== activeOrg?.id) {
      setActiveOrgId(activeProject.organizationId)
    }
  }, [activeProject, activeOrg, setActiveOrgId])

  const scopeOrgId = activeProject?.organizationId ?? activeOrg?.id

  const projects = useMemo(
    () => allProjects.filter((p) => p.organizationId === scopeOrgId),
    [allProjects, scopeOrgId],
  )

  const value = useMemo(
    () => ({ projects, activeProject, loading }),
    [projects, activeProject, loading],
  )

  if (!loading && projectId && !activeProject) {
    return (
      <Navigate to={generatePath(ROUTES.ORG_ROOT, { organizationId })} replace />
    )
  }

  if (activeProject && activeProject.organizationId !== organizationId) {
    const segments = location.pathname.split('/')
    segments[1] = activeProject.organizationId
    return <Navigate to={`${segments.join('/')}${location.search}`} replace />
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
