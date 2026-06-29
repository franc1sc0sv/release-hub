import { useState, type FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Loader2, Trash2, Users, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { motion, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import type { ProjectRole } from '@/generated/graphql'
import {
  LIST_MEMBERS,
  LIST_INVITATIONS,
  INVITE_MEMBER,
  UPDATE_MEMBER_ROLE,
  REMOVE_MEMBER,
  REVOKE_INVITATION,
} from '../graphql/collaboration.operations'
import { GqlInvitationStatus, GqlProjectRole, PROJECT_ROLES } from '../constants'
import { staggerContainer, slideUp } from '@/lib/animations'

function memberInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

interface MembersSectionProps {
  projectId: string
}

export function MembersSection({ projectId }: MembersSectionProps) {
  const { t } = useTranslation('collaboration')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()

  const { data: membersData, loading: membersLoading, error: membersError } = useQuery(LIST_MEMBERS, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: invitationsData, loading: invitationsLoading } = useQuery(LIST_INVITATIONS, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ProjectRole>(GqlProjectRole.MEMBER)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [inviteMember, { loading: inviting }] = useMutation(INVITE_MEMBER, {
    refetchQueries: [{ query: LIST_INVITATIONS, variables: { projectId } }],
    onCompleted() {
      setInviteEmail('')
      setInviteError(null)
    },
    onError() {
      setInviteError(t('invite.error'))
    },
  })

  const [updateRole] = useMutation(UPDATE_MEMBER_ROLE, {
    refetchQueries: [{ query: LIST_MEMBERS, variables: { projectId } }],
  })

  const [removeMember] = useMutation(REMOVE_MEMBER, {
    refetchQueries: [{ query: LIST_MEMBERS, variables: { projectId } }],
  })

  const [revokeInvitation] = useMutation(REVOKE_INVITATION, {
    refetchQueries: [{ query: LIST_INVITATIONS, variables: { projectId } }],
  })

  function handleInvite(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setInviteError(null)
    if (!inviteEmail.includes('@')) return
    inviteMember({ variables: { input: { email: inviteEmail, projectId, role: inviteRole } } })
  }

  const members = membersData?.listMembers ?? []
  const pendingInvitations = (invitationsData?.listInvitations ?? []).filter(
    (inv) => inv.status === GqlInvitationStatus.PENDING,
  )

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  return (
    <div className="space-y-6">
      <Can I={Action.CREATE} a={Subject.INVITATION}>
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <UserPlus className="size-4 text-muted-foreground" />
              {t('invite.label')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder={t('invite.email')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as ProjectRole)}>
                <SelectTrigger className="w-36">
                  <SelectValue>{(value: string) => value ? enumLabels.projectRole(value as ProjectRole) : null}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {enumLabels.projectRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <GradientButton type="submit" disabled={inviting || !inviteEmail}>
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t('invite.sending')}
                  </>
                ) : (
                  t('invite.send')
                )}
              </GradientButton>
            </form>
            {inviteError && (
              <Alert variant="destructive" className="mt-3">
                <AlertDescription>{inviteError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </GlassCard>
      </Can>

      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="size-4 text-muted-foreground" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-[var(--radius-card)]" />
              ))}
            </div>
          )}
          {membersError && (
            <p className="text-sm text-destructive">{membersError.message}</p>
          )}
          {!membersLoading && members.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Users className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('members.empty')}</p>
            </div>
          )}
          {members.length > 0 && (
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-border/40"
            >
              {members.map((member) => (
                <motion.li
                  key={member.id}
                  variants={itemVariants}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar>
                      {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                      <AvatarFallback>{memberInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                        {' · '}
                        {t('members.joinedDate', { date: format(new Date(member.createdAt), 'MMM d, yyyy') })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Can I={Action.MANAGE} a={Subject.MEMBERSHIP}>
                      <Select
                        value={member.role}
                        onValueChange={(v) =>
                          updateRole({
                            variables: { input: { membershipId: member.id, role: v as ProjectRole } },
                          })
                        }
                      >
                        <SelectTrigger size="sm" className="w-28">
                          <SelectValue>{(value: string) => value ? enumLabels.projectRole(value as ProjectRole) : null}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {enumLabels.projectRole(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Can>
                    <Can not I={Action.MANAGE} a={Subject.MEMBERSHIP}>
                      <Badge variant="outline" className="rounded-full">
                        {enumLabels.projectRole(member.role)}
                      </Badge>
                    </Can>
                    <Can I={Action.MANAGE} a={Subject.MEMBERSHIP}>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              aria-label={t('members.remove')}
                            />
                          }
                        >
                          <Trash2 className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('members.confirmRemove', { name: member.name })}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('members.confirmRemoveDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('members.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() =>
                                removeMember({ variables: { membershipId: member.id } })
                              }
                            >
                              {t('members.remove')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Can>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </CardContent>
      </GlassCard>

      {(invitationsLoading || pendingInvitations.length > 0) && (
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('invitations.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            {invitationsLoading && (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-[var(--radius-card)]" />
              </div>
            )}
            {pendingInvitations.length > 0 && (
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border/40"
              >
                {pendingInvitations.map((inv) => (
                  <motion.li
                    key={inv.id}
                    variants={itemVariants}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {enumLabels.projectRole(inv.role)}
                        {' · '}
                        {enumLabels.invitationStatus(inv.status)}
                      </p>
                    </div>
                    <Can I={Action.MANAGE} a={Subject.INVITATION}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => revokeInvitation({ variables: { invitationId: inv.id } })}
                      >
                        {t('invitations.revoke')}
                      </Button>
                    </Can>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </CardContent>
        </GlassCard>
      )}
    </div>
  )
}
