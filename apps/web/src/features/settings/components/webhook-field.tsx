import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Copy, RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'

interface WebhookFieldProps {
  label: string
  url: string | null
  secretSet: boolean
  rotating: boolean
  onRotate: () => void
  revealedSecret: string | null
  onDismissRevealedSecret: () => void
  description?: string
}

export function WebhookField({
  label,
  url,
  secretSet,
  rotating,
  onRotate,
  revealedSecret,
  onDismissRevealedSecret,
  description,
}: WebhookFieldProps) {
  const { t } = useTranslation('settings')
  const [copied, setCopied] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success(t('connections.webhook.copied'))
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopySecret(): Promise<void> {
    if (!revealedSecret) return
    await navigator.clipboard.writeText(revealedSecret)
    setSecretCopied(true)
    toast.success(t('connections.webhook.secretCopied'))
    window.setTimeout(() => setSecretCopied(false), 2000)
  }

  return (
    <div className="space-y-2 rounded-[var(--radius-card)] border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        {secretSet ? (
          <Badge className="rounded-full border-0 bg-chart-4/15 font-medium text-chart-4">
            <CheckCircle2 className="mr-1 size-3" />
            {t('connections.webhook.secretSet')}
          </Badge>
        ) : (
          <Badge className="rounded-full border-0 bg-destructive/15 font-medium text-destructive">
            <XCircle className="mr-1 size-3" />
            {t('connections.webhook.secretNotSet')}
          </Badge>
        )}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="flex items-center gap-2">
        <Input
          value={url ?? ''}
          readOnly
          className="font-mono text-xs"
          aria-label={label}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => void handleCopy()}
          disabled={!url}
          aria-label={t('connections.webhook.copy')}
        >
          {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
        </Button>

        <Can I={Action.UPDATE} a={Subject.PROJECT}>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={rotating}
                  aria-label={t('connections.webhook.rotateSecret')}
                />
              }
            >
              {rotating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('connections.webhook.rotateTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('connections.webhook.rotateDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('connections.dialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onRotate}>
                  {t('connections.webhook.rotateSecret')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Can>
      </div>

      <Dialog
        open={revealedSecret !== null}
        onOpenChange={(open) => {
          if (!open) onDismissRevealedSecret()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('connections.webhook.revealTitle')}</DialogTitle>
            <DialogDescription>{t('connections.webhook.revealDescription')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              value={revealedSecret ?? ''}
              readOnly
              className="font-mono text-xs"
              aria-label={t('connections.webhook.revealTitle')}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void handleCopySecret()}
              aria-label={t('connections.webhook.copySecret')}
            >
              {secretCopied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" onClick={onDismissRevealedSecret}>
              {t('connections.webhook.revealDone')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
