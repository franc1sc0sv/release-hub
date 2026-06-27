import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Rocket } from 'lucide-react'
import { Action, Subject } from '@release-hub/shared'
import { useAuth } from '@/context/auth.context'
import { Can } from '@/context/ability.context'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { StatCard } from '@/components/nebula/StatCard'
import { SectionHeading } from '@/components/nebula/SectionHeading'
import { GlassObject3D } from '@/components/nebula/GlassObject3D'
import { CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/feedback/PageLoader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { slideUp, staggerContainer } from '@/lib/animations'
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const { data, loading, error, refetch } = useDashboardOverview()

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return <ErrorState title={t('error.title')} description={t('error.description')} onRetry={refetch} />
  }

  if (!data || data.stats.length === 0) {
    return (
      <EmptyState
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <Can I={Action.Create} a={Subject.Release}>
            <GradientButton>
              {t('empty.cta')}
              <ArrowUpRight className="size-4" />
            </GradientButton>
          </Can>
        }
      />
    )
  }

  const container = reduceMotion ? undefined : staggerContainer
  const item = reduceMotion ? undefined : slideUp

  return (
    <NebulaBackground className="rounded-3xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-7xl flex-col gap-6 p-6"
      >
        <motion.div variants={item}>
          <GlassCard glow="indigo">
            <CardContent className="grid items-center gap-6 p-8 md:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-4">
                <span className="text-overline uppercase text-brand-magenta">
                  {t('hero.eyebrow')}
                </span>
                <h1 className="font-display text-display-lg text-foreground">
                  {t('hero.greeting', { name: user?.name ?? '' })}{' '}
                  <span className="text-nebula-gradient">{t('hero.accent')}</span>
                </h1>
                <p className="max-w-md text-muted-foreground">{t('hero.description')}</p>
                <Can I={Action.Create} a={Subject.Release}>
                  <GradientButton className="w-fit">
                    {t('hero.cta')}
                    <ArrowUpRight className="size-4" />
                  </GradientButton>
                </Can>
              </div>
              <div className="relative hidden h-56 md:block">
                <GlassObject3D />
                <Rocket className="absolute bottom-2 right-2 size-5 text-brand-indigo-bright" />
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <SectionHeading eyebrow={t('overview.eyebrow')} title={t('overview.title')} />
        </motion.div>

        <motion.div variants={container} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((stat) => (
            <motion.div key={stat.key} variants={item}>
              <StatCard
                label={t(`stats.${stat.key}.label`)}
                value={stat.value}
                trendLabel={stat.trendLabel}
                trendDirection={stat.trendDirection}
                series={stat.series}
                glow={stat.highlighted ? 'magenta' : 'indigo'}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </NebulaBackground>
  )
}
