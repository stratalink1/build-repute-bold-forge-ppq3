'use client'

import React, { useState } from 'react'
import { LoginForm, RegisterForm } from 'lyzr-architect/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-4">
        <Card className="bg-background shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-2xl text-primary">
              {mode === 'register' ? 'Create your account' : 'Welcome back'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'register' ? 'Sign up to generate your website' : 'Log in to continue'}
            </p>
          </CardHeader>
          <CardContent>
            {mode === 'register' ? (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            ) : (
              <LoginForm onSwitchToRegister={() => setMode('register')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
