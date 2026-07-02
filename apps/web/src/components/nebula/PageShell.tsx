import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { NebulaBackground } from './NebulaBackground'
import { PageHeader } from './PageHeader'
import { slideUp, staggerContainer } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface PageShellProps {
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  maxWidth?: string
  children: ReactNode
}

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  maxWidth = 'max-w-7xl',
  children,
}: PageShellProps) {
  const reduceMotion = useReducedMotion()
  const hasHeader = Boolean(eyebrow || title)

  return (
    <NebulaBackground className="p-6">
      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className={cn('mx-auto space-y-8', maxWidth)}
      >
        {hasHeader && (
          <motion.div variants={slideUp}>
            <PageHeader
              overline={eyebrow ?? ''}
              title={title ?? ''}
              description={description}
              actions={actions}
            />
          </motion.div>
        )}
        <motion.div variants={slideUp}>{children}</motion.div>
      </motion.div>
    </NebulaBackground>
  )
}
