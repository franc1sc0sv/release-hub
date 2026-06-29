import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { GitPullRequest } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PullRequestRow } from './PullRequestRow'
import { staggerContainer, slideUp } from '@/lib/animations'
import type { DiffRefsQuery } from '@/generated/graphql'

type PullRequestItem = DiffRefsQuery['diffRefs'][number]

interface MergedPrListProps {
  prs: PullRequestItem[]
}

export function MergedPrList({ prs }: MergedPrListProps) {
  const { t } = useTranslation('releases')

  if (prs.length === 0) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <GitPullRequest className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">{t('builder.noPrs.heading')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('builder.noPrs.description')}</p>
          </div>
        </CardContent>
      </GlassCard>
    )
  }

  const countLabel = t('builder.prList.count', { count: prs.length })

  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-lg font-semibold">
          {t('builder.prList.title')}
        </CardTitle>
        <span className="font-mono text-sm text-muted-foreground">{countLabel}</span>
      </CardHeader>
      <CardContent className="pt-0">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {prs.map((pr) => (
            <motion.div key={pr.id} variants={slideUp}>
              <PullRequestRow pr={pr} />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </GlassCard>
  )
}
