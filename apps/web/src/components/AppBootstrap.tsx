import { useEffect, useState, type ReactNode } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { Loader2, WifiOff } from 'lucide-react'
import { useAuth } from '@/context/auth.context'
import { MeDocument, type MeQuery } from '@/generated/graphql'

interface AppBootstrapProps {
  children: ReactNode
}

function isAuthError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false
  return error.errors.some(
    (e) =>
      e.extensions?.['code'] === 'UNAUTHENTICATED' ||
      e.extensions?.['code'] === 'INVALID_TOKEN',
  )
}

export function AppBootstrap({ children }: AppBootstrapProps) {
  const { setUser } = useAuth()
  const client = useApolloClient()
  const [ready, setReady] = useState(false)
  const [networkError, setNetworkError] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setReady(true)
      return
    }

    client
      .query<MeQuery>({ query: MeDocument, fetchPolicy: 'network-only' })
      .then((result) => {
        if (result.data) setUser(result.data.me)
        setReady(true)
      })
      .catch((error: unknown) => {
        if (isAuthError(error)) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setUser(null)
          setReady(true)
          return
        }
        setNetworkError(true)
        setReady(true)
      })
  }, [client, setUser])

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (networkError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <WifiOff className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No se pudo conectar al servidor</p>
        <button
          type="button"
          className="text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return <>{children}</>
}
