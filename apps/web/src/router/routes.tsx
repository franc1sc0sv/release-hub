import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { RootAuthedLayout } from '@/router/RootAuthedLayout'
import { RedirectToActiveOrg } from '@/router/RedirectToActiveOrg'
import { RequireAbility } from '@/router/RequireAbility'
import { AcceptInvitationPage } from '@/features/collaboration/pages/AcceptInvitationPage'
import { AuthedOnboardingLayout } from '@/router/AuthedOnboardingLayout'
import { ProjectLayout } from '@/router/ProjectLayout'
import { OrgShell } from '@/components/shell/OrgShell'
import { Action, Subject } from '@release-hub/shared'

const LoginPage = React.lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = React.lazy(() => import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const OnboardingPage = React.lazy(
  () => import('@/features/onboarding/pages/OnboardingPage'),
)
const OrgOverviewPage = React.lazy(() => import('@/features/organization/pages/OrgOverviewPage'))
const ReleasesPage = React.lazy(() => import('@/features/releases/pages/ReleasesPage'))
const ReleaseBuilderPage = React.lazy(() => import('@/features/releases/pages/ReleaseBuilderPage'))
const ReleaseViewPage = React.lazy(() => import('@/features/releases/pages/ReleaseViewPage'))
const FeaturesPage = React.lazy(() => import('@/features/features/pages/FeaturesPage'))
const FeatureDetailPage = React.lazy(
  () => import('@/features/features/pages/FeatureDetailPage'),
)
const FlagsPage = React.lazy(() => import('@/features/flags/pages/FlagsPage'))
const FlagDetailPage = React.lazy(() => import('@/features/flags/pages/FlagDetailPage'))
const RepoOpsPage = React.lazy(() => import('@/features/repo-ops/pages/RepoOpsPage'))
const SettingsLayout = React.lazy(() => import('@/features/settings/pages/SettingsLayout'))
const SettingsSectionPage = React.lazy(
  () => import('@/features/settings/pages/SettingsSectionPage'),
)
const CreateProjectPage = React.lazy(
  () => import('@/features/projects/pages/CreateProjectPage'),
)
const OrgSettingsLayout = React.lazy(
  () => import('@/features/organization/pages/OrgSettingsLayout'),
)
const OrgSettingsSectionPage = React.lazy(
  () => import('@/features/organization/pages/OrgSettingsSectionPage'),
)
const OrgIntegrationsLayout = React.lazy(
  () => import('@/features/organization/pages/OrgIntegrationsLayout'),
)
const OrgIntegrationSectionPage = React.lazy(
  () => import('@/features/organization/pages/OrgIntegrationSectionPage'),
)
const GithubSetupPage = React.lazy(
  () => import('@/features/onboarding/pages/GithubSetupPage'),
)

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function withSuspense(node: React.ReactNode) {
  return <React.Suspense fallback={<PageFallback />}>{node}</React.Suspense>
}

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: withSuspense(<LoginPage />),
  },
  {
    path: ROUTES.REGISTER,
    element: withSuspense(<RegisterPage />),
  },
  {
    path: ROUTES.INVITE,
    Component: AcceptInvitationPage,
  },
  {
    path: ROUTES.GITHUB_SETUP,
    element: withSuspense(<GithubSetupPage />),
  },
  {
    path: ROUTES.ONBOARDING,
    Component: AuthedOnboardingLayout,
    children: [
      { index: true, element: withSuspense(<OnboardingPage />) },
    ],
  },
  {
    path: '/',
    Component: RootAuthedLayout,
    children: [
      { index: true, Component: RedirectToActiveOrg },
      {
        path: ':organizationId',
        Component: OrgShell,
        children: [
          { index: true, element: withSuspense(<OrgOverviewPage />) },
          {
            path: 'settings',
            element: withSuspense(<OrgSettingsLayout />),
            children: [
              { index: true, element: <Navigate to="general" replace /> },
              { path: ':section', element: withSuspense(<OrgSettingsSectionPage />) },
            ],
          },
          {
            path: 'integrations',
            element: withSuspense(<OrgIntegrationsLayout />),
            children: [
              { index: true, element: <Navigate to="github" replace /> },
              { path: ':integration', element: withSuspense(<OrgIntegrationSectionPage />) },
            ],
          },
          { path: 'projects/new', element: withSuspense(<CreateProjectPage />) },
        ],
      },
      {
        path: ':organizationId/:projectId',
        Component: ProjectLayout,
        children: [
          { index: true, element: <Navigate to="releases" replace /> },
          {
            path: 'releases',
            children: [
              { index: true, element: withSuspense(<ReleasesPage />) },
              {
                path: 'new',
                element: (
                  <RequireAbility action={Action.CREATE} subject={Subject.RELEASE} />
                ),
                children: [
                  { index: true, element: withSuspense(<ReleaseBuilderPage />) },
                ],
              },
              {
                path: ':releaseId',
                element: (
                  <RequireAbility action={Action.READ} subject={Subject.RELEASE} />
                ),
                children: [
                  { index: true, element: withSuspense(<ReleaseViewPage />) },
                ],
              },
            ],
          },
          {
            path: 'features',
            element: <RequireAbility action={Action.READ} subject={Subject.FEATURE} />,
            children: [
              { index: true, element: withSuspense(<FeaturesPage />) },
              { path: ':id', element: withSuspense(<FeatureDetailPage />) },
            ],
          },
          {
            path: 'flags',
            children: [
              { index: true, element: withSuspense(<FlagsPage />) },
              { path: ':flagKey', element: withSuspense(<FlagDetailPage />) },
            ],
          },
          { path: 'repo-ops', element: withSuspense(<RepoOpsPage />) },
          {
            path: 'settings',
            element: withSuspense(<SettingsLayout />),
            children: [
              { index: true, element: <Navigate to="connections" replace /> },
              { path: ':section', element: withSuspense(<SettingsSectionPage />) },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
