import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useQuery } from '@apollo/client/react'
import { LIST_PROJECTS } from '@/features/workspace/graphql/workspace.queries'
import type { ListProjectsQuery } from '@/generated/graphql'

type ProjectItem = ListProjectsQuery['listProjects'][number]

interface ProjectContextValue {
  projects: ProjectItem[]
  activeProject: ProjectItem | null
  setActiveProjectId: (id: string) => void
  loading: boolean
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

const STORAGE_KEY = 'release-hub:active-project-id'

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const { data, loading } = useQuery(LIST_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  })

  const projects: ProjectItem[] = data?.listProjects ?? []

  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  )

  const setActiveProjectId = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setActiveProjectIdState(id)
  }

  useEffect(() => {
    if (projects.length === 0) return
    const stored = localStorage.getItem(STORAGE_KEY)
    const isValid = stored && projects.some((p) => p.id === stored)
    if (!isValid) {
      setActiveProjectId(projects[0].id)
    }
  }, [projects])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null,
    [projects, activeProjectId],
  )

  const value = useMemo(
    () => ({ projects, activeProject, setActiveProjectId, loading }),
    [projects, activeProject, loading],
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
