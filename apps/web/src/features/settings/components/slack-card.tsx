import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MessageSquare, CheckCircle2, XCircle, Loader2, Send } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { slideUp } from '@/lib/animations'
import { useSlackConnection } from '../hooks/use-slack-connection'

interface SlackCardProps {
  projectId: string
}

export function SlackCard({ projectId }: SlackCardProps) {
  const { t } = useTranslation('settings')
  const reduceMotion = useReducedMotion()
  const slack = useSlackConnection(projectId)

  useEffect(() => {
    if (slack.connected) {
      void slack.loadChannels()
    }
  }, [slack.connected])

  async function handleSendTest(): Promise<void> {
    const result = await slack.sendTestMessage()
    if (result.ok) {
      toast.success(t('connections.slack.testSent'))
    } else {
      toast.error(result.error ?? t('connections.slack.testFailed'))
    }
  }

  const itemVariants = reduceMotion ? undefined : slideUp

  return (
    <m.li
      variants={itemVariants}
      className="flex flex-col gap-4 px-6 py-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="size-5 text-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('connections.slack.label')}</p>
            <p className="text-xs text-muted-foreground">{t('connections.slack.description')}</p>
            {slack.connected && slack.teamName && (
              <p className="mt-0.5 text-xs text-muted-foreground">{slack.teamName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {slack.connected ? (
            <>
              <Badge className="rounded-full border-0 bg-chart-4/15 font-medium text-chart-4">
                <CheckCircle2 className="mr-1 size-3" />
                {t('connections.slack.connected')}
              </Badge>
              <Can I={Action.UPDATE} a={Subject.PROJECT}>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={slack.disconnecting}
                      />
                    }
                  >
                    {t('connections.disconnect')}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('connections.dialog.disconnectTitle', {
                          name: t('connections.slack.label'),
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
                        onClick={() => slack.disconnectSlack()}
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
                {t('connections.slack.disconnected')}
              </Badge>
              <Can I={Action.UPDATE} a={Subject.PROJECT}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void slack.connect()}
                  disabled={slack.loading}
                >
                  {t('connections.slack.connect')}
                </Button>
              </Can>
            </>
          )}
        </div>
      </div>

      {slack.connected && (
        <div className="ml-[52px] space-y-4 rounded-[var(--radius-card)] border border-border/60 bg-muted/20 p-4">
          <div className="space-y-2">
            <Label htmlFor="slack-channel">{t('connections.slack.channelLabel')}</Label>
            <Select
              value={slack.channelId ?? ''}
              onValueChange={(value) => {
                const channel = slack.channels.find((c) => c.id === value)
                if (channel) {
                  slack.selectChannel(channel.id, channel.name)
                }
              }}
            >
              <SelectTrigger id="slack-channel" className="w-full max-w-xs">
                <SelectValue>
                  {() =>
                    slack.channelName ?? t('connections.slack.channelPlaceholder')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {slack.loadingChannels && (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    {t('connections.slack.loadingChannels')}
                  </div>
                )}
                {!slack.loadingChannels &&
                  slack.channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      #{channel.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="notify-created" className="font-normal text-foreground">
                {t('connections.slack.notifyOnCreated')}
              </Label>
              <Switch
                id="notify-created"
                checked={slack.notifyOnCreated}
                onCheckedChange={(checked) =>
                  slack.updateNotifications(checked, slack.notifyOnShipped, slack.notifyOnDeployed)
                }
                disabled={slack.updatingNotificationSettings}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="notify-shipped" className="font-normal text-foreground">
                {t('connections.slack.notifyOnShipped')}
              </Label>
              <Switch
                id="notify-shipped"
                checked={slack.notifyOnShipped}
                onCheckedChange={(checked) =>
                  slack.updateNotifications(slack.notifyOnCreated, checked, slack.notifyOnDeployed)
                }
                disabled={slack.updatingNotificationSettings}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="notify-deployed" className="font-normal text-foreground">
                {t('connections.slack.notifyOnDeployed')}
              </Label>
              <Switch
                id="notify-deployed"
                checked={slack.notifyOnDeployed}
                onCheckedChange={(checked) =>
                  slack.updateNotifications(slack.notifyOnCreated, slack.notifyOnShipped, checked)
                }
                disabled={slack.updatingNotificationSettings}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleSendTest()}
            disabled={slack.sendingTest || !slack.channelId}
          >
            {slack.sendingTest ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            {t('connections.slack.sendTest')}
          </Button>
        </div>
      )}
    </m.li>
  )
}
