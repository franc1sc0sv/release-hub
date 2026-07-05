import { Navigate, generatePath } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useOrganization } from '@/context/organization.context'
import { ROUTES } from '@/lib/routes'

export function RedirectToActiveOrg() {
  const { activeOrg, organizations, loading } = useOrganization()

  if (loading && organizations.length === 0) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const org = activeOrg ?? organizations[0] ?? null
  if (!org) return null

  return <Navigate to={generatePath(ROUTES.ORG_ROOT, { organizationId: org.id })} replace />
}
