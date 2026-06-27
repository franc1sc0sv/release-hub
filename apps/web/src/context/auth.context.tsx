import { createContext, useContext, useState, ReactNode } from 'react'
import type { UserRole } from '@release-hub/shared'

interface IAuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl: string | null
}

interface AuthContextValue {
  user: IAuthUser | null
  setUser: (user: IAuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IAuthUser | null>(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
