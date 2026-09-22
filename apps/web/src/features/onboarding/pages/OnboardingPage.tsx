import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useOrganization } from '@/context/organization.context'
import { CreateOrgStage } from '@/features/onboarding/components/CreateOrgStage'
import { InstallAppStage } from '@/features/onboarding/components/InstallAppStage'
import { OnboardingProgress } from '@/features/onboarding/components/OnboardingProgress'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReceivedInvitationsList } from '@/features/collaboration/components/ReceivedInvitationsList'
import { useMyInvitations } from '@/features/collaboration/hooks/use-my-invitations'

export default function OnboardingPage() {
  const { t } = useTranslation('onboarding')
  const { organizations, activeOrg, loading } = useOrganization()
  const { invitations } = useMyInvitations()

  if (loading && organizations.length === 0) {
    return (
      <main className="relative flex min-h-svh flex-col items-center justify-center gap-3 overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,color-mix(in_oklab,var(--brand-indigo-bright)_20%,transparent),transparent_60%)]"
        />
        <ThemeToggle />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </main>
    )
  }

  if (activeOrg?.githubConnected) {
    return <Navigate to="/" replace />
  }

  const needsOrg = organizations.length === 0

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--brand-indigo-bright)_22%,transparent),transparent_55%),radial-gradient(circle_at_80%_85%,color-mix(in_oklab,var(--brand-magenta)_16%,transparent),transparent_55%)]"
      />
      <ThemeToggle />
      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        <OnboardingProgress currentStep={needsOrg ? 'createOrg' : 'installApp'} />
        {needsOrg && invitations.length > 0 && (
          <GlassCard glow="magenta" className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-display">{t('invitations.title')}</CardTitle>
              <CardDescription>{t('invitations.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ReceivedInvitationsList invitations={invitations} />
            </CardContent>
          </GlassCard>
        )}
        {needsOrg ? <CreateOrgStage /> : <InstallAppStage />}
      </div>
    </main>
  )
}
