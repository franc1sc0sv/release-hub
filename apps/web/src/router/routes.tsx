import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedLayout } from '@/router/ProtectedLayout'

const DashboardPage = React.lazy(() => import('@/features/dashboard/DashboardPage'))

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
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
    ],
  },
])
