import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Github, Flag, Link2, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useConnectionSettings } from '../hooks/use-connection-settings'
import { useGithubConnection } from '../hooks/use-github-connection'
import { useLinearConnection } from '../hooks/use-linear-connection'

interface ConnectionsSectionProps {
  projectId: string
}

interface FlagsmithProjectOption {
  id: string
  name: string
}

type DialogStep = 'credentials' | 'project'

interface VerifyResult {
  ok: boolean
  projectName: string | null | undefined
  environments: string[]
  hasStaging: boolean
  hasProduction: boolean
  warnings: string[]
  message: string | null | undefined
}

interface ConnectDialogState {
  step: DialogStep
  apiKey: string
  flagsmithUrl: string
  projects: FlagsmithProjectOption[]
  selectedProjectId: string | null
  error: string | null
  verifyResult: VerifyResult | null
}

export function ConnectionsSection({ projectId }: ConnectionsSectionProps) {
  const { t } = useTranslation('settings')
  const reduceMotion = useReducedMotion()
  const {
    settings,
    loading,
    updating,
    loadingProjects,
    verifying,
    loadFlagsmithProjects,
    verifyFlagsmithConnection,
    connectFlagsmith,
    disconnectFlagsmith,
  } = useConnectionSettings(projectId)
  const github = useGithubConnection()
  const linear = useLinearConnection(projectId)

  const [dialog, setDialog] = useState<ConnectDialogState | null>(null)

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  function openDialog(): void {
    setDialog({
      step: 'credentials',
      apiKey: '',
      flagsmithUrl: '',
      projects: [],
      selectedProjectId: null,
      error: null,
      verifyResult: null,
    })
  }

  function closeDialog(): void {
    setDialog(null)
  }

  async function handleContinue(): Promise<void> {
    if (!dialog) return

    if (!dialog.flagsmithUrl.trim()) {
      setDialog((prev) => prev && { ...prev, error: t('connections.dialog.urlRequired') })
      return
    }

    if (!dialog.apiKey.trim()) {
      setDialog((prev) => prev && { ...prev, error: t('connections.dialog.apiKeyRequired') })
      return
    }

    try {
      const projects = await loadFlagsmithProjects(
        dialog.flagsmithUrl.trim(),
        dialog.apiKey.trim(),
      )
      if (projects.length === 0) {
        setDialog((prev) => prev && { ...prev, error: t('connections.dialog.noProjects') })
        return
      }
      setDialog(
        (prev) =>
          prev && {
            ...prev,
            step: 'project',
            projects,
            selectedProjectId: projects[0].id,
            error: null,
            verifyResult: null,
          },
      )
    } catch {
      setDialog((prev) => prev && { ...prev, error: t('connections.dialog.loadProjectsError') })
    }
  }

  async function handleVerify(): Promise<void> {
    if (!dialog || !dialog.selectedProjectId) return
    try {
      const result = await verifyFlagsmithConnection(
        dialog.flagsmithUrl.trim(),
        dialog.apiKey.trim(),
        dialog.selectedProjectId,
      )
      setDialog((prev) => prev && { ...prev, verifyResult: result, error: null })
    } catch {
      setDialog((prev) => prev && { ...prev, error: t('connections.dialog.loadProjectsError') })
    }
  }

  function handleSave(): void {
    if (!dialog) return
    if (!dialog.selectedProjectId) {
      setDialog((prev) => prev && { ...prev, error: t('connections.dialog.projectRequired') })
      return
    }
    connectFlagsmith(dialog.apiKey.trim(), dialog.flagsmithUrl.trim(), dialog.selectedProjectId)
    closeDialog()
  }

  function handleBack(): void {
    setDialog((prev) => prev && { ...prev, step: 'credentials', error: null, verifyResult: null })
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!dialog) return
    if (dialog.step === 'credentials') {
      void handleContinue()
    } else {
      handleSave()
    }
  }

  if (loading) {
    return (
      <GlassCard>
        <CardContent className="space-y-4 p-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-card)]" />
          ))}
        </CardContent>
      </GlassCard>
    )
  }

  return (
    <>
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Link2 className="size-4 text-muted-foreground" />
            {t('sections.connections')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border/40"
          >
            <motion.li
              variants={itemVariants}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Github className="size-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('connections.github.label')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('connections.github.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {github.connected ? (
                  <>
                    <Badge className="rounded-full border-0 bg-chart-4/15 font-medium text-chart-4">
                      <CheckCircle2 className="mr-1 size-3" />
                      {t('connections.github.connected')}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => github.reconnect()}
                      disabled={github.loading || github.reconnecting}
                    >
                      {t('connections.reconnect')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge className="rounded-full border-0 bg-destructive/15 font-medium text-destructive">
                      <XCircle className="mr-1 size-3" />
                      {t('connections.github.disconnected')}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => github.connect()}
                      disabled={github.loading}
                    >
                      {t('connections.github.connect')}
                    </Button>
                  </>
                )}
              </div>
            </motion.li>

            <motion.li
              variants={itemVariants}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Flag className="size-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('connections.flagsmith.label')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('connections.flagsmith.description')}
                  </p>
                  {settings?.flagsmithConnected && settings.flagsmithUrl && (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {settings.flagsmithUrl}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {settings?.flagsmithConnected ? (
                  <>
                    <Badge className="rounded-full border-0 bg-chart-4/15 font-medium text-chart-4">
                      <CheckCircle2 className="mr-1 size-3" />
                      {t('connections.flagsmith.connected')}
                    </Badge>
                    <Can I={Action.UPDATE} a={Subject.PROJECT}>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              disabled={updating}
                            />
                          }
                        >
                          {t('connections.disconnect')}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('connections.dialog.disconnectTitle', {
                                name: t('connections.flagsmith.label'),
                              })}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('connections.dialog.disconnectDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('connections.dialog.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={disconnectFlagsmith}
                            >
                              {t('connections.disconnect')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Can>
                  </>
                ) : (
                  <>
                    <Badge className="rounded-full border-0 bg-destructive/15 font-medium text-destructive">
                      <XCircle className="mr-1 size-3" />
                      {t('connections.flagsmith.disconnected')}
                    </Badge>
                    <Can I={Action.UPDATE} a={Subject.PROJECT}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog()}
                        disabled={updating}
                      >
                        {t('connections.flagsmith.connect')}
                      </Button>
                    </Can>
                  </>
                )}
              </div>
            </motion.li>

            <motion.li
              variants={itemVariants}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Link2 className="size-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('connections.linear.label')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('connections.linear.description')}
                  </p>
                  {linear.connected && linear.linearUser && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{linear.linearUser}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {linear.connected ? (
                  <>
                    <Badge className="rounded-full border-0 bg-chart-4/15 font-medium text-chart-4">
                      <CheckCircle2 className="mr-1 size-3" />
                      {t('connections.linear.connected')}
                    </Badge>
                    <Can I={Action.UPDATE} a={Subject.PROJECT}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => linear.connect()}
                        disabled={linear.loading}
                      >
                        {t('connections.reconnect')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              disabled={linear.disconnecting}
                            />
                          }
                        >
                          {t('connections.disconnect')}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('connections.dialog.disconnectTitle', {
                                name: t('connections.linear.label'),
                              })}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('connections.dialog.disconnectDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('connections.dialog.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => linear.disconnectLinear()}
                            >
                              {t('connections.disconnect')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Can>
                  </>
                ) : (
                  <>
                    <Badge className="rounded-full border-0 bg-destructive/15 font-medium text-destructive">
                      <XCircle className="mr-1 size-3" />
                      {t('connections.linear.disconnected')}
                    </Badge>
                    <Can I={Action.UPDATE} a={Subject.PROJECT}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => linear.connect()}
                        disabled={linear.loading}
                      >
                        {t('connections.linear.connect')}
                      </Button>
                    </Can>
                  </>
                )}
              </div>
            </motion.li>
          </motion.ul>
        </CardContent>
      </GlassCard>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('connections.flagsmith.connect')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {dialog?.step === 'credentials' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="flagsmith-url">{t('connections.dialog.flagsmithUrl')}</Label>
                  <Input
                    id="flagsmith-url"
                    type="url"
                    placeholder={t('connections.dialog.flagsmithUrlPlaceholder')}
                    value={dialog.flagsmithUrl}
                    onChange={(e) =>
                      setDialog((prev) => prev && { ...prev, flagsmithUrl: e.target.value })
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">{t('connections.dialog.apiKey')}</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={t('connections.dialog.apiKeyPlaceholder')}
                    value={dialog.apiKey}
                    onChange={(e) =>
                      setDialog((prev) => prev && { ...prev, apiKey: e.target.value })
                    }
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('connections.dialog.apiKeyHint')}
                  </p>
                </div>
              </>
            )}

            {dialog?.step === 'project' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flagsmith-project">
                    {t('connections.dialog.flagsmithProject')}
                  </Label>
                  <Select
                    value={dialog.selectedProjectId ?? ''}
                    onValueChange={(v) =>
                      setDialog((prev) => prev && { ...prev, selectedProjectId: v, verifyResult: null })
                    }
                  >
                    <SelectTrigger id="flagsmith-project" className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          value
                            ? (dialog.projects.find((p) => p.id === value)?.name ?? value)
                            : t('connections.dialog.flagsmithProjectPlaceholder')
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {dialog.projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t('connections.dialog.flagsmithProjectHint')}
                  </p>
                </div>

                {dialog.verifyResult && dialog.verifyResult.ok && (
                  <Alert className="border-chart-4/30 bg-chart-4/10">
                    <CheckCircle2 className="size-4 text-chart-4" />
                    <AlertDescription className="text-chart-4">
                      <span className="font-medium">
                        {t('connections.dialog.verify.environments')}:{' '}
                      </span>
                      {dialog.verifyResult.environments.length > 0
                        ? dialog.verifyResult.environments.join(', ')
                        : t('connections.dialog.verify.noEnvironments')}
                    </AlertDescription>
                  </Alert>
                )}

                {dialog.verifyResult && dialog.verifyResult.ok && dialog.verifyResult.warnings.length > 0 && (
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="size-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-500">
                      {dialog.verifyResult.warnings.join(' ')}
                    </AlertDescription>
                  </Alert>
                )}

                {dialog.verifyResult && !dialog.verifyResult.ok && (
                  <Alert variant="destructive">
                    <XCircle className="size-4" />
                    <AlertDescription>
                      {dialog.verifyResult.message ?? t('connections.dialog.verify.failed')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {dialog?.error && (
              <Alert variant="destructive">
                <AlertDescription>{dialog.error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              {dialog?.step === 'project' ? (
                <>
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    {t('connections.dialog.back')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleVerify()}
                    disabled={verifying || !dialog.selectedProjectId}
                  >
                    {verifying && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {verifying
                      ? t('connections.dialog.verify.verifying')
                      : t('connections.dialog.verify.testConnection')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      updating ||
                      !dialog.selectedProjectId ||
                      (dialog.verifyResult !== null && !dialog.verifyResult.ok)
                    }
                  >
                    {updating && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t('connections.dialog.save')}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="ghost" onClick={closeDialog}>
                    {t('connections.dialog.cancel')}
                  </Button>
                  <Button type="submit" disabled={loadingProjects}>
                    {loadingProjects && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t('connections.dialog.continue')}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
