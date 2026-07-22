import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AlertTriangle, Bell, Flag, Loader2, Mail, Rocket, Send, type LucideIcon } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
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
import { cn } from '@/lib/utils'
import { staggerContainer, slideUp } from '@/lib/animations'
import {
  ALL_NOTIFICATION_TYPES,
  RELEASE_NOTIFICATION_TYPES,
  FLAG_NOTIFICATION_TYPES,
  NotificationChannelValue,
  NotificationTypeValue,
  DigestFrequencyValue,
  DIGEST_FREQUENCY_OPTIONS,
} from '@/lib/notification-enums'
import { NOTIFICATION_TYPE_ICON } from '@/features/notifications/constants/notification-icons'
import { useNotificationPreferences } from '../hooks/use-notification-preferences'
import type { DigestFrequency, NotificationChannel, NotificationType } from '@/generated/graphql'

interface NotificationPreferencesSectionProps {
  projectId: string
}

interface NotificationGroup {
  key: string
  icon: LucideIcon
  labelKey: string
  types: NotificationType[]
}

interface NotificationColumn {
  channel: NotificationChannel
  label: string
  icon: LucideIcon
}

const GRID_CLASS_BY_COLUMN_COUNT: Record<number, string> = {
  2: 'grid-cols-[minmax(0,1fr)_5rem_5rem]',
}

const GROUPS: NotificationGroup[] = [
  { key: 'releases', icon: Rocket, labelKey: 'groups.releases.label', types: RELEASE_NOTIFICATION_TYPES },
  { key: 'flags', icon: Flag, labelKey: 'groups.flags.label', types: FLAG_NOTIFICATION_TYPES },
]

const DIGEST_ENABLED: boolean = false

function visibleTypes(types: NotificationType[]): NotificationType[] {
  return DIGEST_ENABLED
    ? types
    : types.filter((type) => type !== NotificationTypeValue.FLAG_DIGEST)
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
    error,
    updating,
    triggeringDigest,
    setPreference,
    setPreferencesForColumn,
    triggerDigest,
  } = useNotificationPreferences(projectId)

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
      )?.digestFrequency ?? DigestFrequencyValue.WEEKLY
    )
  }

  function allEnabled(notificationTypes: NotificationType[], channel: NotificationChannel): boolean {
    return notificationTypes.every((notificationType) => isEnabled(notificationType, channel))
  }

  async function handleBulkToggle(
    notificationTypes: NotificationType[],
    channel: NotificationChannel,
  ): Promise<void> {
    await setPreferencesForColumn(notificationTypes, channel, !allEnabled(notificationTypes, channel))
  }

  async function handleTriggerDigest(): Promise<void> {
    try {
      await triggerDigest()
      toast.success(t('digest.testSent'))
    } catch {
      toast.error(t('digest.testFailed'))
    }
  }

  const columns: NotificationColumn[] = [
    { channel: NotificationChannelValue.IN_APP, label: t('channels.inApp'), icon: Bell },
    { channel: NotificationChannelValue.EMAIL, label: t('channels.email'), icon: Mail },
  ]
  const gridClass = GRID_CLASS_BY_COLUMN_COUNT[columns.length] ?? GRID_CLASS_BY_COLUMN_COUNT[2]

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <Skeleton className="h-10 w-48 rounded-[var(--radius-button)]" />
            <Skeleton className="h-8 w-40 rounded-[var(--radius-button)]" />
          </CardContent>
        </GlassCard>
        {GROUPS.map((group) => (
          <GlassCard key={group.key}>
            <CardContent className="space-y-3 p-6">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-14 w-full rounded-[var(--radius-card)]" />
              ))}
            </CardContent>
          </GlassCard>
        ))}
        <GlassCard>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full rounded-[var(--radius-button)]" />
          </CardContent>
        </GlassCard>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="size-6 text-destructive" />}
        heading={t('error.heading')}
        description={t('error.description')}
      />
    )
  }

  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <m.div variants={itemVariants}>
        <GlassCard>
          <CardContent className={cn('grid items-center gap-4 px-6 py-4', gridClass)}>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('allNotifications.label')}
              </p>
              <p className="text-xs text-muted-foreground">{t('allNotifications.description')}</p>
            </div>
            {columns.map((column) => {
              const checked = allEnabled(visibleTypes(ALL_NOTIFICATION_TYPES), column.channel)
              return (
                <div key={column.channel} className="flex flex-col items-center gap-1 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <column.icon className="size-3.5 text-muted-foreground" aria-hidden />
                    <span className="text-overline uppercase text-muted-foreground">
                      {column.label}
                    </span>
                  </div>
                  <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                    {(allowed) => (
                      <div className={cn('rounded-full', checked && 'shadow-glow-indigo')}>
                        <Switch
                          checked={checked}
                          onCheckedChange={() =>
                            void handleBulkToggle(visibleTypes(ALL_NOTIFICATION_TYPES), column.channel)
                          }
                          disabled={!allowed || updating}
                          aria-label={t('allNotifications.toggleAriaLabel', {
                            channel: column.label,
                          })}
                        />
                      </div>
                    )}
                  </Can>
                </div>
              )
            })}
          </CardContent>
        </GlassCard>
      </m.div>

      {GROUPS.map((group) => (
        <m.div key={group.key} variants={itemVariants}>
          <GlassCard>
            <CardHeader className="gap-3 px-6">
              <div className={cn('grid items-center gap-4', gridClass)}>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <group.icon className="size-4 text-muted-foreground" aria-hidden />
                  {t(group.labelKey)}
                </CardTitle>
                {columns.map((column) => (
                  <div key={column.channel} className="flex flex-row items-center justify-center gap-1.5 text-center">
                    <column.icon className="size-3.5 text-muted-foreground" aria-hidden />
                    <span className="text-overline uppercase text-muted-foreground">
                      {column.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className={cn('grid items-center gap-4 border-t border-border/40 pt-3', gridClass)}>
                <span className="text-xs font-medium text-muted-foreground">
                  {t('groups.enableAll')}
                </span>
                {columns.map((column) => {
                  const checked = allEnabled(visibleTypes(group.types), column.channel)
                  return (
                    <div key={column.channel} className="flex justify-center">
                      <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                        {(allowed) => (
                          <div className={cn('rounded-full', checked && 'shadow-glow-indigo')}>
                            <Switch
                              checked={checked}
                              onCheckedChange={() => void handleBulkToggle(visibleTypes(group.types), column.channel)}
                              disabled={!allowed || updating}
                              aria-label={t('groups.enableAllAriaLabel', {
                                group: t(group.labelKey),
                                channel: column.label,
                              })}
                            />
                          </div>
                        )}
                      </Can>
                    </div>
                  )
                })}
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {visibleTypes(group.types).map((notificationType) => {
                const EventIcon = NOTIFICATION_TYPE_ICON[notificationType]
                return (
                  <div
                    key={notificationType}
                    className={cn(
                      'grid items-center gap-4 px-6 py-3 transition-colors hover:bg-accent/30',
                      gridClass,
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <EventIcon className="size-4 text-foreground" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {enumLabels.notificationType(notificationType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t(`hints.${notificationType}`)}
                        </p>
                      </div>
                    </div>
                    {columns.map((column) => (
                      <div key={column.channel} className="flex justify-center">
                        <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                          {(allowed) => (
                            <Switch
                              checked={isEnabled(notificationType, column.channel)}
                              onCheckedChange={(checked) =>
                                void setPreference(
                                  notificationType,
                                  column.channel,
                                  checked,
                                  notificationType === NotificationTypeValue.FLAG_DIGEST &&
                                    column.channel === NotificationChannelValue.EMAIL
                                    ? digestFrequencyFor(notificationType)
                                    : null,
                                )
                              }
                              disabled={!allowed || updating}
                              aria-label={t('toggleAriaLabel', {
                                type: enumLabels.notificationType(notificationType),
                                channel: column.label,
                              })}
                            />
                          )}
                        </Can>
                      </div>
                    ))}
                  </div>
                )
              })}
            </CardContent>
          </GlassCard>
        </m.div>
      ))}

      {DIGEST_ENABLED && (
      <m.div variants={itemVariants}>
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              {t('digest.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t('digest.frequencyLabel')}</p>
              <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
                {(allowed) => (
                  <Select
                    value={digestFrequencyFor(NotificationTypeValue.FLAG_DIGEST)}
                    onValueChange={(value) => {
                      if (!value) return
                      void setPreference(
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
              <p className="text-xs text-muted-foreground">{t('digest.description')}</p>
            </div>
            <Can I={Action.UPDATE} a={Subject.PROJECT}>
              <GradientButton
                type="button"
                onClick={() => void handleTriggerDigest()}
                disabled={triggeringDigest}
                className="gap-2 border-0 bg-nebula-gradient text-white shadow-glow-indigo hover:shadow-glow-lg"
              >
                {triggeringDigest ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {t('digest.sendTest')}
              </GradientButton>
            </Can>
          </CardContent>
        </GlassCard>
      </m.div>
      )}
    </m.div>
  )
}
