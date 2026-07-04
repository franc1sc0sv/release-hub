import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="glass flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-brand-indigo-bright/40 px-4 py-2 shadow-glow-indigo">
            <span className="font-mono text-sm text-foreground">
              {t('table.selectionCount', { count })}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClear}>
                {t('table.clearSelection')}
              </Button>
              <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
                <Trash2 className="size-3.5" aria-hidden />
                {t('table.deleteSelected')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
