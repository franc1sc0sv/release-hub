import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Bell, Loader2, Send } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { staggerContainer, slideUp } from '@/lib/animations'
import {
  NOTIFICATION_TYPE_OPTIONS,
  NotificationChannelValue,
  NotificationTypeValue,
  DIGEST_FREQUENCY_OPTIONS,
} from '../constants/notification-enums'
import { useNotificationPreferences } from '../hooks/use-notification-preferences'
import { useSlackConnection } from '../hooks/use-slack-connection'
import type { DigestFrequency, NotificationType } from '@/generated/graphql'

interface NotificationPreferencesSectionProps {
  projectId: string
}

export function NotificationPreferencesSection({
  projectId,
}: NotificationPreferencesSectionProps) {
  const { t } = useTranslation('notifications')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()
  const { preferences, loading, updating, triggeringDigest, setPreference, triggerDigest } =
    useNotificationPreferences(projectId)
  const slack = useSlackConnection(projectId)

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  function isEnabled(notificationType: NotificationType, channel: string): boolean {
    return (
      preferences.find((p) => p.notificationType === notificationType && p.channel === channel)
        ?.enabled ?? false
    )
  }

  function digestFrequencyFor(notificationType: NotificationType): DigestFrequency {
    return (
      preferences.find(
        (p) =>
          p.notificationType === notificationType &&
          p.channel === NotificationChannelValue.EMAIL,
      )?.digestFrequency ?? 'WEEKLY'
    )
  }

  async function handleTriggerDigest(): Promise<void> {
    try {
      await triggerDigest()
      toast.success(t('digest.testSent'))
    } catch {
      toast.error(t('digest.testFailed'))
    }
  }

  if (loading) {
    return (
      <GlassCard>
        <CardContent className="space-y-3 p-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-[var(--radius-card)]" />
          ))}
        </CardContent>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bell className="size-4 text-muted-foreground" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-overline uppercase text-muted-foreground">
                  {t('columns.notification')}
                </TableHead>
                <TableHead className="text-overline text-center uppercase text-muted-foreground">
                  {t('columns.email')}
                </TableHead>
                {slack.connected && (
                  <TableHead className="text-overline text-center uppercase text-muted-foreground">
                    {t('columns.slack')}
                  </TableHead>
                )}
                <TableHead className="text-overline uppercase text-muted-foreground">
                  {t('columns.digestFrequency')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NOTIFICATION_TYPE_OPTIONS.map((notificationType) => (
                <motion.tr
                  key={notificationType}
                  variants={itemVariants}
                  className="border-border/40 transition-colors hover:bg-accent/40"
                >
                  <TableCell className="font-medium text-foreground">
                    {enumLabels.notificationType(notificationType)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                      {(allowed) => (
                        <Switch
                          aria-label={t('toggleAriaLabel', {
                            type: enumLabels.notificationType(notificationType),
                            channel: t('columns.email'),
                          })}
                          checked={isEnabled(notificationType, NotificationChannelValue.EMAIL)}
                          onCheckedChange={(checked) =>
                            setPreference(
                              notificationType,
                              NotificationChannelValue.EMAIL,
                              checked,
                              notificationType === NotificationTypeValue.FLAG_DIGEST
                                ? digestFrequencyFor(notificationType)
                                : null,
                            )
                          }
                          disabled={!allowed || updating}
                        />
                      )}
                    </Can>
                  </TableCell>
                  {slack.connected && (
                    <TableCell className="text-center">
                      <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                        {(allowed) => (
                          <Switch
                            aria-label={t('toggleAriaLabel', {
                              type: enumLabels.notificationType(notificationType),
                              channel: t('columns.slack'),
                            })}
                            checked={isEnabled(
                              notificationType,
                              NotificationChannelValue.SLACK_DM,
                            )}
                            onCheckedChange={(checked) =>
                              setPreference(
                                notificationType,
                                NotificationChannelValue.SLACK_DM,
                                checked,
                              )
                            }
                            disabled={!allowed || updating}
                          />
                        )}
                      </Can>
                    </TableCell>
                  )}
                  {notificationType === NotificationTypeValue.FLAG_DIGEST ? (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                          {(allowed) => (
                            <Select
                              value={digestFrequencyFor(notificationType)}
                              onValueChange={(value) => {
                                if (!value) return
                                setPreference(
                                  notificationType,
                                  NotificationChannelValue.EMAIL,
                                  isEnabled(notificationType, NotificationChannelValue.EMAIL),
                                  value as DigestFrequency,
                                )
                              }}
                              disabled={!allowed || updating}
                            >
                              <SelectTrigger
                                className="w-36"
                                aria-label={t('digest.frequencyLabel')}
                              >
                                <SelectValue>
                                  {(value: string) =>
                                    value ? enumLabels.digestFrequency(value as DigestFrequency) : null
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {DIGEST_FREQUENCY_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {enumLabels.digestFrequency(option)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </Can>
                        <Can I={Action.UPDATE} a={Subject.PROJECT}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleTriggerDigest()}
                            disabled={triggeringDigest}
                          >
                            {triggeringDigest ? (
                              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-1.5 size-3.5" />
                            )}
                            {t('digest.sendTest')}
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  ) : (
                    <TableCell />
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </CardContent>
    </GlassCard>
  )
}
