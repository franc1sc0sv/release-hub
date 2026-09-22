import { generatePath, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { MailPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import type { MyInvitationsQuery } from '@/generated/graphql'

type ReceivedInvitation = MyInvitationsQuery['myInvitations'][number]

interface ReceivedInvitationsListProps {
  invitations: ReceivedInvitation[]
  onOpen?: () => void
}

export function ReceivedInvitationsList({ invitations, onOpen }: ReceivedInvitationsListProps) {
  const { t, i18n } = useTranslation('collaboration')
  const { orgRole } = useEnumLabels()
  const navigate = useNavigate()
  const locale = i18n.language.startsWith('es') ? es : enUS

  function openInvitation(token: string): void {
    onOpen?.()
    navigate(generatePath(ROUTES.INVITE, { token }))
  }

  return (
    <ul className="flex flex-col gap-1" aria-label={t('receivedInvitations.title')}>
      {invitations.map((invitation) => (
        <li
          key={invitation.id}
          className="flex items-start gap-3 rounded-[var(--radius-card)] bg-brand-indigo-bright/10 p-3"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
            <MailPlus className="size-4 text-indigo-400" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {t('receivedInvitations.itemTitle', {
                inviter: invitation.inviterName,
                organization: invitation.organizationName,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('receivedInvitations.itemRole', { role: orgRole(invitation.role) })}
            </p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={invitation.expiresAt}>
                {t('receivedInvitations.expires', {
                  time: formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true, locale }),
                })}
              </time>
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => openInvitation(invitation.token)}>
            {t('receivedInvitations.accept')}
          </Button>
        </li>
      ))}
    </ul>
  )
}
