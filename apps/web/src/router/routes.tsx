import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ProtectedLayout } from '@/router/ProtectedLayout'
import { RequireAbility } from '@/router/RequireAbility'
import { AcceptInvitationPage } from '@/features/collaboration/pages/AcceptInvitationPage'
import { AuthedOnboardingLayout } from '@/router/AuthedOnboardingLayout'
import { Action, Subject } from '@release-hub/shared'

const OnboardingPage = React.lazy(
  () => import('@/features/onboarding/pages/OnboardingPage'),
)
const WorkspacePage = React.lazy(() => import('@/features/workspace/pages/WorkspacePage'))
const ReleasesPage = React.lazy(() => import('@/features/releases/pages/ReleasesPage'))
const ReleaseBuilderPage = React.lazy(() => import('@/features/releases/pages/ReleaseBuilderPage'))
const ReleaseViewPage = React.lazy(() => import('@/features/releases/pages/ReleaseViewPage'))
const FeaturesPage = React.lazy(() => import('@/features/features/pages/FeaturesPage'))
const FeatureDetailPage = React.lazy(
  () => import('@/features/features/pages/FeatureDetailPage'),
)
const FlagsPage = React.lazy(() => import('@/features/flags/pages/FlagsPage'))
const SettingsPage = React.lazy(() => import('@/features/settings/pages/SettingsPage'))
const CreateProjectPage = React.lazy(
  () => import('@/features/projects/pages/CreateProjectPage'),
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
    Component: LoginPage,
  },
  {
    path: ROUTES.REGISTER,
    Component: RegisterPage,
  },
  {
    path: ROUTES.INVITE,
    Component: AcceptInvitationPage,
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
    Component: ProtectedLayout,
    children: [
      { index: true, element: <Navigate to={ROUTES.WORKSPACE} replace /> },
      { path: 'workspace', element: withSuspense(<WorkspacePage />) },
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
          {
            path: ':id',
            children: [
              { index: true, element: withSuspense(<FeatureDetailPage />) },
            ],
          },
        ],
      },
      { path: 'flags', element: withSuspense(<FlagsPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: 'projects/new', element: withSuspense(<CreateProjectPage />) },
    ],
  },
])
