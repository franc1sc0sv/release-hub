import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Flag, Loader2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useFlagRegistry } from '../hooks/use-flag-registry'
import { useFlagReminderInterval } from '../hooks/use-flag-reminder-interval'
import { useConflictEnvironments } from '../hooks/use-conflict-environments'
import { RepoFileCombobox } from './repo-file-combobox'

interface FlagTrackingSectionProps {
  projectId: string
}

export function FlagTrackingSection({ projectId }: FlagTrackingSectionProps) {
  const { t } = useTranslation('settings')
  const reduceMotion = useReducedMotion()
  const {
    flagRegistry,
    loadingFlagRegistry,
    searchResults,
    searching,
    saving,
    searchRepoFiles,
    saveFlagRegistry,
  } = useFlagRegistry(projectId)

  const [path, setPath] = useState('')
  const [branch, setBranch] = useState('')
  const [configured, setConfigured] = useState<{ path: string; branch: string | null } | null>(
    null,
  )

  useEffect(() => {
    if (!flagRegistry) return
    setPath(flagRegistry.flagRegistryPath ?? '')
    setBranch(flagRegistry.flagRegistryBranch ?? '')
    if (flagRegistry.flagRegistryPath) {
      setConfigured({
        path: flagRegistry.flagRegistryPath,
        branch: flagRegistry.flagRegistryBranch,
      })
    }
  }, [flagRegistry])

  const {
    flagReminderIntervalDays,
    loading: loadingReminderInterval,
    saving: savingReminderInterval,
    saveReminderInterval,
  } = useFlagReminderInterval(projectId)

  const [reminderIntervalInput, setReminderIntervalInput] = useState('')
  const [reminderIntervalError, setReminderIntervalError] = useState(false)

  useEffect(() => {
    if (flagReminderIntervalDays === undefined) return
    setReminderIntervalInput(String(flagReminderIntervalDays))
  }, [flagReminderIntervalDays])

  const {
    environments: conflictEnvironmentOptions,
    conflictEnvironments,
    loading: loadingConflictEnvironments,
    saving: savingConflictEnvironments,
    saveConflictEnvironments,
  } = useConflictEnvironments(projectId)

  const [selectedConflictEnvironments, setSelectedConflictEnvironments] = useState<string[]>([])

  useEffect(() => {
    if (conflictEnvironments === undefined) return
    setSelectedConflictEnvironments(conflictEnvironments)
  }, [conflictEnvironments])

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  async function handleSaveReminderInterval(): Promise<void> {
    const days = Number(reminderIntervalInput)
    if (!Number.isInteger(days) || days < 1) {
      setReminderIntervalError(true)
      return
    }
    setReminderIntervalError(false)
    try {
      await saveReminderInterval(days)
      toast.success(t('flagTracking.reminderInterval.saveSuccess'))
    } catch {
      toast.error(t('flagTracking.reminderInterval.saveError'))
    }
  }

  function toggleConflictEnvironment(env: string): void {
    setSelectedConflictEnvironments((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
    )
  }

  async function handleSaveConflictEnvironments(): Promise<void> {
    try {
      await saveConflictEnvironments(selectedConflictEnvironments)
      toast.success(t('flagTracking.conflictEnvironments.saveSuccess'))
    } catch {
      toast.error(t('flagTracking.conflictEnvironments.saveError'))
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!path.trim()) {
      toast.error(t('flagTracking.registry.pathRequired'))
      return
    }
    try {
      const result = await saveFlagRegistry(path, branch)
      const saved = result.data?.setFlagRegistry
      if (saved) {
        setConfigured({ path: saved.flagRegistryPath ?? path, branch: saved.flagRegistryBranch })
      }
      toast.success(t('flagTracking.registry.saveSuccess'))
    } catch {
      toast.error(t('flagTracking.registry.saveError'))
    }
  }

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Flag className="size-4 text-muted-foreground" />
          {t('flagTracking.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="space-y-4"
        >
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground">
            {t('flagTracking.description')}
          </motion.p>

          {loadingFlagRegistry && (
            <motion.p
              variants={itemVariants}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {t('flagTracking.registry.loading')}
            </motion.p>
          )}

          {!loadingFlagRegistry && configured?.path && (
            <motion.p variants={itemVariants} className="font-mono text-xs text-muted-foreground">
              {t('flagTracking.registry.current', {
                path: configured.path,
                branch: configured.branch ?? t('flagTracking.registry.defaultBranch'),
              })}
            </motion.p>
          )}

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="flag-registry-path">{t('flagTracking.registry.pathLabel')}</Label>
            <RepoFileCombobox
              id="flag-registry-path"
              value={path}
              onChange={setPath}
              results={searchResults}
              searching={searching}
              onSearch={(query) => searchRepoFiles(query, branch)}
              disabled={saving || loadingFlagRegistry}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="flag-registry-branch">{t('flagTracking.registry.branchLabel')}</Label>
            <Input
              id="flag-registry-branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder={t('flagTracking.registry.branchPlaceholder')}
              disabled={saving || loadingFlagRegistry}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">{t('flagTracking.registry.branchHint')}</p>
          </motion.div>

          <Can I={Action.UPDATE} a={Subject.PROJECT}>
            <motion.div variants={itemVariants}>
              <Button type="submit" disabled={saving || loadingFlagRegistry}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t('flagTracking.registry.save')}
              </Button>
            </motion.div>
          </Can>
        </motion.form>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 space-y-2 border-t border-border/60 pt-4"
        >
          <motion.div variants={itemVariants}>
            <Label htmlFor="flag-reminder-interval">{t('flagTracking.reminderInterval.label')}</Label>
          </motion.div>
          <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
            {(allowed) => (
              <>
                <motion.div variants={itemVariants}>
                  <Input
                    id="flag-reminder-interval"
                    type="number"
                    min={1}
                    value={reminderIntervalInput}
                    onChange={(e) => {
                      setReminderIntervalInput(e.target.value)
                      setReminderIntervalError(false)
                    }}
                    disabled={!allowed || savingReminderInterval || loadingReminderInterval}
                    aria-invalid={reminderIntervalError}
                    className="max-w-32"
                  />
                </motion.div>
                {reminderIntervalError && (
                  <motion.p variants={itemVariants} className="text-xs text-destructive">
                    {t('flagTracking.reminderInterval.invalid')}
                  </motion.p>
                )}
                <motion.p variants={itemVariants} className="text-xs text-muted-foreground">
                  {t('flagTracking.reminderInterval.hint')}
                </motion.p>
                {allowed && (
                  <motion.div variants={itemVariants}>
                    <Button
                      type="button"
                      onClick={() => void handleSaveReminderInterval()}
                      disabled={savingReminderInterval || loadingReminderInterval}
                    >
                      {savingReminderInterval && <Loader2 className="mr-2 size-4 animate-spin" />}
                      {t('flagTracking.reminderInterval.save')}
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </Can>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 space-y-2 border-t border-border/60 pt-4"
        >
          <motion.div variants={itemVariants} className="space-y-1">
            <Label>{t('flagTracking.conflictEnvironments.title')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('flagTracking.conflictEnvironments.description')}
            </p>
          </motion.div>

          {loadingConflictEnvironments ? (
            <motion.p
              variants={itemVariants}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {t('flagTracking.conflictEnvironments.loading')}
            </motion.p>
          ) : conflictEnvironmentOptions.length === 0 ? (
            <motion.p variants={itemVariants} className="text-xs text-muted-foreground">
              {t('flagTracking.conflictEnvironments.empty')}
            </motion.p>
          ) : (
            <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
              {(allowed) => (
                <>
                  <motion.div
                    variants={itemVariants}
                    role="group"
                    aria-label={t('flagTracking.conflictEnvironments.title')}
                    className="flex flex-wrap gap-2"
                  >
                    {conflictEnvironmentOptions.map((env) => {
                      const isSelected = selectedConflictEnvironments.includes(env)
                      return (
                        <Button
                          key={env}
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-pressed={isSelected}
                          disabled={!allowed || savingConflictEnvironments}
                          onClick={() => toggleConflictEnvironment(env)}
                          className={[
                            'gap-1.5 rounded-full font-mono text-xs transition-colors',
                            isSelected
                              ? 'border-brand-indigo-bright bg-brand-indigo-bright/10 text-brand-indigo-bright hover:bg-brand-indigo-bright/20'
                              : 'text-muted-foreground',
                          ].join(' ')}
                        >
                          {isSelected && <Check className="size-3.5" aria-hidden />}
                          {env}
                        </Button>
                      )
                    })}
                  </motion.div>
                  <motion.p variants={itemVariants} className="text-xs text-muted-foreground">
                    {selectedConflictEnvironments.length === 0
                      ? t('flagTracking.conflictEnvironments.allWatched')
                      : t('flagTracking.conflictEnvironments.filtered')}
                  </motion.p>
                  {allowed && (
                    <motion.div variants={itemVariants}>
                      <Button
                        type="button"
                        onClick={() => void handleSaveConflictEnvironments()}
                        disabled={savingConflictEnvironments}
                      >
                        {savingConflictEnvironments && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        {t('flagTracking.conflictEnvironments.save')}
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </Can>
          )}
        </motion.div>
      </CardContent>
    </GlassCard>
  )
}
