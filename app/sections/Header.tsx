'use client'

import React from 'react'
import type { AuthUser } from '@/hooks/useAuth'

interface HeaderProps {
  user: AuthUser | null
  onSignInClick: () => void
  onSignOut: () => void
}

const linkStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: 'rgba(0,0,0,0.55)',
  textDecoration: 'none',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
}

export default function Header({ user, onSignInClick, onSignOut }: HeaderProps) {
  return (
    <header className="w-full" style={{ borderBottom: '1px solid rgba(104,92,74,0.08)' }}>
      <div
        className="mx-auto flex items-center justify-between px-5 md:px-10 py-4"
        style={{ maxWidth: 1360 }}
      >
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M14 2C14 2 5 10 5 16a9 9 0 0018 0C23 10 14 2 14 2z" fill="#E8A000" />
            <text x="14" y="20" textAnchor="middle" fill="white" fontWeight="700" fontSize="12" fontFamily="Inter, sans-serif">R</text>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>
            Repute
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <>
              {user.email && (
                <span
                  className="hidden sm:inline"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.42)' }}
                >
                  {user.email}
                </span>
              )}
              <button onClick={onSignOut} style={linkStyle}>
                Sign out
              </button>
            </>
          ) : (
            <button onClick={onSignInClick} style={linkStyle}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
