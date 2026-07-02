import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/nebula/GlassCard'

interface SelectionActionBarProps {
  count: number
  onClear: () => void
  onDelete: () => void
}

export function SelectionActionBar({ count, onClear, onDelete }: SelectionActionBarProps) {
  const { t } = useTranslation('repoOps')
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="sticky bottom-6 z-20 mx-auto w-fit"
        >
          <GlassCard glow="indigo" className="flex items-center gap-4 rounded-full px-5 py-3">
            <span className="font-mono text-sm text-foreground">
              {t('table.selectionCount', { count })}
            </span>
            <Button variant="ghost" size="sm" onClick={onClear}>
              {t('table.clearSelection')}
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
              <Trash2 className="size-3.5" aria-hidden />
              {t('table.deleteSelected')}
            </Button>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
