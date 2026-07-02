import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/nebula/PageShell'
import { FeatureLedger } from '../components/FeatureLedger'

export default function FeaturesPage() {
  const { t } = useTranslation('features')

  return (
    <PageShell eyebrow={t('subtitle')} title={t('title')}>
      <FeatureLedger />
    </PageShell>
  )
}
