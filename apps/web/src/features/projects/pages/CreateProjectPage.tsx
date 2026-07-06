import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { Button } from '@/components/ui/button'
import { RepoPicker } from '@/features/projects/components/RepoPicker'
import { ROUTES } from '@/lib/routes'
import { staggerContainer, slideUp } from '@/lib/animations'
import type { CreateProjectMutation } from '@/generated/graphql'

type CreatedProject = CreateProjectMutation['createProject']

export default function CreateProjectPage() {
  const { t } = useTranslation('workspace')
  const navigate = useNavigate()
  const params = useParams<{ organizationId: string }>()
  const organizationId = params.organizationId!
  const reducedMotion = useReducedMotion()

  const containerVariants = reducedMotion ? {} : staggerContainer
  const itemVariants = reducedMotion ? {} : slideUp

  function handleCreated(project: CreatedProject): void {
    navigate(generatePath(ROUTES.PROJECT_ROOT, { organizationId, projectId: project.id }), {
      replace: true,
    })
  }

  return (
    <NebulaBackground className="p-6">
      <m.div
        className="mx-auto max-w-7xl space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
            aria-label={t('createProject.back')}
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t('createProject.back')}
          </Button>
          <p className="text-overline uppercase tracking-widest text-muted-foreground">
            {t('createProject.overline')}
          </p>
          <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
            {t('createProject.title')}
          </h1>
        </m.div>

        <m.div variants={itemVariants} className="flex justify-center">
          <RepoPicker onCreated={handleCreated} />
        </m.div>
      </m.div>
    </NebulaBackground>
  )
}
