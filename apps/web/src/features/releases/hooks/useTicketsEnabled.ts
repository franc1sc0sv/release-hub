import type { GetProjectQuery, ListProjectsQuery } from '@/generated/graphql'

type ProjectFromGetProject = GetProjectQuery['getProject']
type ProjectFromListProjects = ListProjectsQuery['listProjects'][number]
type ProjectWithHealth = ProjectFromGetProject | ProjectFromListProjects

export function useTicketsEnabled(project: ProjectWithHealth | null | undefined): boolean {
  if (!project) return false
  return project.connectionHealth.linear === 'CONNECTED'
}
