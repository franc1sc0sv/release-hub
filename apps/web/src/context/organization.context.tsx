import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { MY_ORGANIZATIONS } from '@/features/organization/graphql/organization.operations'
import type { MyOrganizationsQuery } from '@/generated/graphql'

type OrganizationItem = MyOrganizationsQuery['myOrganizations'][number]

interface OrganizationContextValue {
  organizations: OrganizationItem[]
  activeOrg: OrganizationItem | null
  setActiveOrgId: (id: string) => void
  refetch: () => Promise<unknown>
  loading: boolean
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export const ACTIVE_ORG_STORAGE_KEY = 'release-hub:active-org-id'

interface OrganizationProviderProps {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { organizationId } = useParams()
  const { data, loading, refetch } = useQuery(MY_ORGANIZATIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const organizations: OrganizationItem[] = data?.myOrganizations ?? []

  const [storedOrgId, setStoredOrgId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_ORG_STORAGE_KEY),
  )

  const setActiveOrgId = (id: string) => {
    localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, id)
    setStoredOrgId(id)
  }

  const activeOrg = useMemo(() => {
    const fromParam = organizationId
      ? organizations.find((o) => o.id === organizationId)
      : undefined
    if (fromParam) return fromParam
    const fromStorage = storedOrgId
      ? organizations.find((o) => o.id === storedOrgId)
      : undefined
    return fromStorage ?? organizations[0] ?? null
  }, [organizations, organizationId, storedOrgId])

  const value = useMemo(
    () => ({ organizations, activeOrg, setActiveOrgId, refetch, loading }),
    [organizations, activeOrg, refetch, loading],
  )

  return (
    <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
  )
}

export function useOrganization(): OrganizationContextValue {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider')
  return ctx
}
