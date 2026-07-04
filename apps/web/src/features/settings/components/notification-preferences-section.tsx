import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Bell, Loader2, Send } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  ALL_NOTIFICATION_TYPES,
  RELEASE_NOTIFICATION_TYPES,
  FLAG_NOTIFICATION_TYPES,
  NotificationChannelValue,
  NotificationTypeValue,
  DIGEST_FREQUENCY_OPTIONS,
} from '@/lib/notification-enums'
import { useNotificationPreferences } from '../hooks/use-notification-preferences'
import { useSlackConnection } from '../hooks/use-slack-connection'
import type { DigestFrequency, NotificationChannel, NotificationType } from '@/generated/graphql'

interface NotificationPreferencesSectionProps {
  projectId: string
}

interface NotificationGroup {
  key: string
  label: string
  types: NotificationType[]
}

export function NotificationPreferencesSection({
  projectId,
}: NotificationPreferencesSectionProps) {
  const { t } = useTranslation('notifications')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()
  const {
    preferences,
    loading,
    updating,
    triggeringDigest,
    setPreference,
    setPreferencesForColumn,
    triggerDigest,
  } = useNotificationPreferences(projectId)
  const slack = useSlackConnection(projectId)

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  function isEnabled(notificationType: NotificationType, channel: NotificationChannel): boolean {
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

  const columns: { channel: NotificationChannel; label: string }[] = [
    { channel: NotificationChannelValue.IN_APP, label: t('columns.inApp') },
    { channel: NotificationChannelValue.EMAIL, label: t('columns.email') },
    ...(slack.connected
      ? [{ channel: NotificationChannelValue.SLACK_DM, label: t('columns.slack') }]
      : []),
  ]

  const groups: NotificationGroup[] = [
    { key: 'releases', label: t('groups.releases'), types: RELEASE_NOTIFICATION_TYPES },
    { key: 'flags', label: t('groups.flags'), types: FLAG_NOTIFICATION_TYPES },
  ]

  function columnCheckedState(channel: NotificationChannel): {
    checked: boolean
    indeterminate: boolean
  } {
    const enabledCount = ALL_NOTIFICATION_TYPES.filter((type) => isEnabled(type, channel)).length
    return {
      checked: enabledCount === ALL_NOTIFICATION_TYPES.length,
      indeterminate: enabledCount > 0 && enabledCount < ALL_NOTIFICATION_TYPES.length,
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
                {columns.map((column) => (
                  <TableHead
                    key={column.channel}
                    className="text-overline text-center uppercase text-muted-foreground"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/40 bg-muted/20 hover:bg-muted/20">
                <TableCell className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('columns.selectAllRow')}
                </TableCell>
                {columns.map((column) => {
                  const { checked, indeterminate } = columnCheckedState(column.channel)
                  return (
                    <TableCell key={column.channel} className="text-center">
                      <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                        {(allowed) => (
                          <Checkbox
                            checked={checked}
                            indeterminate={indeterminate}
                            onCheckedChange={(value) =>
                              setPreferencesForColumn(
                                ALL_NOTIFICATION_TYPES,
                                column.channel,
                                value === true,
                              )
                            }
                            disabled={!allowed || updating}
                            aria-label={t('columns.selectAllAriaLabel', { channel: column.label })}
                          />
                        )}
                      </Can>
                    </TableCell>
                  )
                })}
              </TableRow>

              {groups.flatMap((group) => [
                <TableRow key={`${group.key}-header`} className="border-border/40 hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length + 1}
                    className="bg-muted/10 text-overline uppercase tracking-widest text-muted-foreground"
                  >
                    {group.label}
                  </TableCell>
                </TableRow>,
                ...group.types.map((notificationType) => (
                  <motion.tr
                    key={notificationType}
                    variants={itemVariants}
                    className="border-border/40 transition-colors hover:bg-accent/40"
                  >
                    <TableCell className="font-medium text-foreground">
                      {enumLabels.notificationType(notificationType)}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.channel} className="text-center">
                        <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                          {(allowed) => (
                            <Checkbox
                              aria-label={t('toggleAriaLabel', {
                                type: enumLabels.notificationType(notificationType),
                                channel: column.label,
                              })}
                              checked={isEnabled(notificationType, column.channel)}
                              onCheckedChange={(checked) =>
                                setPreference(
                                  notificationType,
                                  column.channel,
                                  checked === true,
                                  notificationType === NotificationTypeValue.FLAG_DIGEST &&
                                    column.channel === NotificationChannelValue.EMAIL
                                    ? digestFrequencyFor(notificationType)
                                    : null,
                                )
                              }
                              disabled={!allowed || updating}
                            />
                          )}
                        </Can>
                      </TableCell>
                    ))}
                  </motion.tr>
                )),
              ])}
            </TableBody>
          </Table>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">{t('digest.frequencyLabel')}</p>
            <p className="text-xs text-muted-foreground">{t('digest.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
              {(allowed) => (
                <Select
                  value={digestFrequencyFor(NotificationTypeValue.FLAG_DIGEST)}
                  onValueChange={(value) => {
                    if (!value) return
                    setPreference(
                      NotificationTypeValue.FLAG_DIGEST,
                      NotificationChannelValue.EMAIL,
                      isEnabled(NotificationTypeValue.FLAG_DIGEST, NotificationChannelValue.EMAIL),
                      value as DigestFrequency,
                    )
                  }}
                  disabled={!allowed || updating}
                >
                  <SelectTrigger className="w-36" aria-label={t('digest.frequencyLabel')}>
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
        </div>
      </CardContent>
    </GlassCard>
  )
}
