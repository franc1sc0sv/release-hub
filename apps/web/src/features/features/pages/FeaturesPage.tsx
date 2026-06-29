import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { PageHeader } from '@/components/nebula/PageHeader'
import { slideUp } from '@/lib/animations'
import { FeatureLedger } from '../components/FeatureLedger'

export default function FeaturesPage() {
  const { t } = useTranslation('features')
  const reduceMotion = useReducedMotion()

  return (
    <NebulaBackground className="p-6">
      <motion.div
        variants={slideUp}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-7xl space-y-8"
      >
        <PageHeader overline={t('subtitle')} title={t('title')} />
        <FeatureLedger />
      </motion.div>
    </NebulaBackground>
  )
}
