'use client'

import React, { useState } from 'react'
import { HiArrowRight } from 'react-icons/hi'

interface HeroProps {
  url: string
  setUrl: (url: string) => void
  onSubmit: (url: string) => void
  isRunning: boolean
  mode?: 'public' | 'authed'
}

export default function Hero({ url, setUrl, onSubmit, isRunning, mode = 'authed' }: HeroProps) {
  const [error, setError] = useState('')
  const isPublic = mode === 'public'
  const ctaLabel = isRunning
    ? (isPublic ? 'Reading your reviews...' : 'Generating...')
    : (isPublic ? 'See what your reviews reveal' : 'Generate my website')
  const helperText = isPublic
    ? 'Free preview. No credit card. We read your reviews and show you the patterns before you sign up.'
    : 'Works with Google Maps, Zomato, JustDial, Practo, and more.'

  const handleSubmit = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Please paste a link or type a business name.')
      return
    }
    setError('')
    // If it looks like a URL (starts with http), pass directly
    if (/^https?:\/\//i.test(trimmed)) {
      onSubmit(trimmed)
    } else {
      // Treat as a business name / demo mode
      onSubmit(`Find reviews for: ${trimmed}`)
    }
  }

  return (
    <section id="hero-section" className="py-16 md:py-24 px-5 md:px-10">
      <div className="mx-auto text-center" style={{ maxWidth: 824 }}>
        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-lora), Georgia, serif',
            fontWeight: 400,
            letterSpacing: -1.12,
            lineHeight: 1.1,
            color: 'rgba(0,0,0,0.9)',
          }}
          className="text-3xl md:text-5xl lg:text-[56px] mb-6"
        >
          Your website, written by your customers
        </h1>

        {/* Sub-copy - single line */}
        <p
          className="text-base md:text-lg mb-10"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(0,0,0,0.55)',
            lineHeight: '28px',
            maxWidth: 720,
            margin: '0 auto 40px',
          }}
        >
          Your customers already wrote what makes you worth choosing. Repute reads their reviews, finds the patterns, and turns them into a one-page site in their words, not yours.
        </p>

        {/* Form */}
        <div className="mx-auto" style={{ maxWidth: 560 }}>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              id="google-maps-url"
              name="google-maps-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError('')
              }}
              placeholder="Paste a Google Maps link or type a business name"
              className="flex-1 outline-none transition-colors duration-200"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                height: 50,
                padding: '0 16px',
                background: 'white',
                border: `1px solid ${error ? '#E07856' : '#D9D9D9'}`,
                borderRadius: 8,
                color: '#1A1A1A',
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.4)'
              }}
              onBlur={(e) => {
                if (!error) e.currentTarget.style.borderColor = '#D9D9D9'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
              disabled={isRunning}
            />
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 500,
                height: 50,
                padding: '0 24px',
                background: '#1A1A1A',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {ctaLabel}
              {!isRunning && <HiArrowRight size={16} />}
            </button>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#888', marginTop: 12, textAlign: 'center' }}>
            {helperText}
          </p>

          {error && (
            <p className="mt-2 text-left" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#E07856' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
