'use client'

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

export interface AuthUser {
  id: string
  email?: string
  name?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as any).id ?? session.user.email ?? '',
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      }
    : null

  const signOut = () => nextAuthSignOut({ redirect: false }).then(() => undefined)

  return {
    user,
    loading: status === 'loading',
    signOut,
  }
}
