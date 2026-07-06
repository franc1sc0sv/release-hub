import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'motion/react'
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
      <m.div
        variants={staggerContainer}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className={cn('mx-auto space-y-8', maxWidth)}
      >
        {hasHeader && (
          <m.div variants={slideUp}>
            <PageHeader
              overline={eyebrow ?? ''}
              title={title ?? ''}
              description={description}
              actions={actions}
            />
          </m.div>
        )}
        <m.div variants={slideUp}>{children}</m.div>
      </m.div>
    </NebulaBackground>
  )
}
