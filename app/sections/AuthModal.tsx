'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('email', { email, redirect: false })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-4">
        <Card className="bg-background shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-2xl text-primary">
              {sent ? 'Check your inbox' : 'Sign in'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {sent
                ? 'Click the magic link in your email to continue'
                : 'Enter your email to get a magic link'}
            </p>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending link...' : 'Send magic link'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-foreground">
                  We sent a sign-in link to <strong>{email}</strong>. Click it to continue.
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md font-medium hover:bg-muted transition-colors"
                >
                  Use a different email
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
