'use client'

import { useState, useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AgentInterceptorProvider } from '@/components/AgentInterceptorProvider'
import { HydrationGuard } from '@/components/HydrationGuard'

/**
 * Top-level client-side providers.
 *
 * Order matters:
 *   - ErrorBoundary catches everything inside
 *   - SessionProvider must wrap anything that uses `useSession()`
 *   - AgentInterceptorProvider is lyzr-builder-mode plumbing, will be
 *     conditionalised in Phase 1
 *   - HydrationGuard suppresses dev-only hydration warnings from injected
 *     browser extensions
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // During SSR/prerendering, render children directly without providers.
  // SessionProvider with no initial session is also safe to render on the
  // server but the existing pattern here is to defer all providers, so
  // we keep that.
  if (!mounted) return <>{children}</>

  return (
    <ErrorBoundary>
      <SessionProvider>
        <AgentInterceptorProvider>
          <HydrationGuard>
            {children}
          </HydrationGuard>
        </AgentInterceptorProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
