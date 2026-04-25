'use client'

import { useCallback, useEffect, useState } from 'react'

export interface AuthUser {
  id: string
  email?: string
  name?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Thin client-side wrapper around the lyzr-architect auth API mounted at
 * /api/auth/*. The login + register forms come from lyzr-architect/client
 * and live inside AuthModal, so this hook only needs to read the current
 * user and handle sign-out + refresh.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      // The lyzr-architect handler may return { user } or the user object directly.
      const u = data?.user ?? data?.data ?? data
      if (u && typeof u === 'object' && (u.id || u._id || u.email)) {
        setUser({ id: u.id ?? u._id, email: u.email, name: u.name })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // best effort
    }
    setUser(null)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { user, loading, signOut, refresh }
}
