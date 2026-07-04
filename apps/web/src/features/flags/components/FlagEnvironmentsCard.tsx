import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnvStateCell } from './EnvStateCell'
import type { GetFlagDetailQuery } from '@/generated/graphql'

type FlagDetail = NonNullable<GetFlagDetailQuery['flagDetail']>
type FlagDetailEnvironment = FlagDetail['flagsmith']['environments'][number]

interface FlagEnvironmentRowProps {
  env: FlagDetailEnvironment
}

function FlagEnvironmentRow({ env }: FlagEnvironmentRowProps) {
  const { t, i18n } = useTranslation('flags')
  const locale = i18n.language.startsWith('es') ? es : enUS

  return (
    <li className="flex flex-wrap items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-foreground">
        {env.name}
      </span>
      <EnvStateCell enabled={env.enabled} onLabel={t('state.on')} offLabel={t('state.off')} />
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {env.value ?? '—'}
      </span>
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {t('detail.environments.updated', {
          time: formatDistanceToNow(new Date(env.updatedAt), { addSuffix: true, locale }),
        })}
      </span>
    </li>
  )
}

interface FlagEnvironmentsCardProps {
  environments: FlagDetailEnvironment[]
}

export function FlagEnvironmentsCard({ environments }: FlagEnvironmentsCardProps) {
  const { t } = useTranslation('flags')

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          {t('detail.environments.title')}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {environments.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {environments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('detail.environments.empty')}
          </p>
        ) : (
          <ul className="space-y-0">
            {environments.map((env) => (
              <FlagEnvironmentRow key={env.name} env={env} />
            ))}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}
