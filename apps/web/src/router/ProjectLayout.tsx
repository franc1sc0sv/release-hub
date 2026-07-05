import { ProjectProvider } from '@/context/project.context'
import { ProjectShell } from '@/components/shell/ProjectShell'

export function ProjectLayout() {
  return (
    <ProjectProvider>
      <ProjectShell />
    </ProjectProvider>
  )
}
