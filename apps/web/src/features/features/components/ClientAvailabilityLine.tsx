import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ClientAvailabilityKey } from '../constants/client-availability'

interface ClientAvailabilityLineProps {
  clientAvailabilityKey: string
}

export function ClientAvailabilityLine({ clientAvailabilityKey }: ClientAvailabilityLineProps) {
  const { t } = useTranslation('features')

  if (clientAvailabilityKey === ClientAvailabilityKey.INTERNAL_ONLY) {
    return (
      <Badge className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-300">
        {t('clientAvailability.internal_only_badge')}
      </Badge>
    )
  }

  return (
    <span className="text-xs text-muted-foreground">
      {t(`clientAvailability.${clientAvailabilityKey}`)}
    </span>
  )
}
