import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { useProject } from '@/context/project.context'
import { RepoPicker } from '@/features/projects/components/RepoPicker'
import type { CreateProjectMutation } from '@/generated/graphql'

type CreatedProject = CreateProjectMutation['createProject']

export function SelectRepoStage() {
  const navigate = useNavigate()
  const { setActiveProjectId } = useProject()

  function handleCreated(project: CreatedProject): void {
    setActiveProjectId(project.id)
    navigate(ROUTES.WORKSPACE, { replace: true })
  }

  return <RepoPicker onCreated={handleCreated} />
}
