import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Tag, X, Plus, Loader2, Tags } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useProjectTags } from '../hooks/use-project-tags'

interface TagsSectionProps {
  projectId: string
}

export function TagsSection({ projectId }: TagsSectionProps) {
  const { t } = useTranslation('settings')
  const reduceMotion = useReducedMotion()
  const { tags, loading, creating, createError, addTag, removeTag } =
    useProjectTags(projectId)

  const [newTagName, setNewTagName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    submitTag()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitTag()
    }
  }

  async function submitTag(): Promise<void> {
    const trimmed = newTagName.trim()
    if (!trimmed) {
      setLocalError(t('tags.validation.required'))
      return
    }
    setLocalError(null)
    try {
      await addTag(trimmed)
      setNewTagName('')
    } catch {
      setLocalError(t('tags.validation.serverError'))
    }
  }

  const serverError = createError?.message ?? null
  const displayError = localError ?? serverError

  return (
    <>
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Tag className="size-4 text-muted-foreground" />
            {t('sections.tags')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Can I={Action.UPDATE} a={Subject.PROJECT}>
            <form onSubmit={handleSubmit} noValidate className="flex gap-2">
              <Input
                placeholder={t('tags.placeholder')}
                value={newTagName}
                onChange={(e) => {
                  setNewTagName(e.target.value)
                  setLocalError(null)
                }}
                onKeyDown={handleKeyDown}
                aria-label={t('tags.add')}
                disabled={creating}
              />
              <GradientButton
                type="submit"
                disabled={creating || !newTagName.trim()}
                className="shrink-0"
                aria-label={t('tags.add')}
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {t('tags.add')}
              </GradientButton>
            </form>

            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}
          </Can>

          {loading && (
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          )}

          {!loading && tags.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Tags className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('tags.empty')}</p>
            </div>
          )}

          {tags.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2"
            >
              <AnimatePresence>
                {tags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    variants={itemVariants}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
                    }
                    layout={!reduceMotion}
                  >
                    <Badge
                      className="flex items-center gap-1.5 rounded-full border-border/60 bg-muted px-3 py-1 text-sm font-medium text-foreground"
                      style={tag.color ? { borderColor: tag.color, borderWidth: 1 } : undefined}
                    >
                      {tag.color && (
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                          aria-hidden="true"
                        />
                      )}
                      {tag.name}
                      <Can I={Action.UPDATE} a={Subject.PROJECT}>
                        <button
                          type="button"
                          className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => setPendingDeleteId(tag.id)}
                          aria-label={t('tags.removeLabel', { name: tag.name })}
                        >
                          <X className="size-3" />
                        </button>
                      </Can>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </GlassCard>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tags.dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tags.dialog.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('tags.dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDeleteId) {
                  removeTag(pendingDeleteId)
                  setPendingDeleteId(null)
                }
              }}
            >
              {t('tags.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
