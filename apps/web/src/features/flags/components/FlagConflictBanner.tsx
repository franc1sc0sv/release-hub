import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function FlagConflictBanner() {
  const { t } = useTranslation('flags')

  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden />
      <AlertTitle>{t('detail.conflict.heading')}</AlertTitle>
      <AlertDescription>{t('detail.conflict.description')}</AlertDescription>
    </Alert>
  )
}
