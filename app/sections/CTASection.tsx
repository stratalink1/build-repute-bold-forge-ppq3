'use client'

import React from 'react'
import { ReputeLogo } from './Navbar'

interface CTAProps {
  urlInput: string
  setUrlInput: (v: string) => void
  onGenerate: () => void
  loading: boolean
}

export default function CTASection({ urlInput, setUrlInput, onGenerate, loading }: CTAProps) {
  return (
    <section style={{ background: '#1A1A1A', padding: '96px 48px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div className="flex justify-center" style={{ marginBottom: 24 }}>
          <ReputeLogo dark iconSize={28} />
        </div>

        <h2 style={{ fontSize: 40, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, maxWidth: 640, margin: '0 auto' }}>
          India's reputation economy starts here.
        </h2>
        <p style={{ fontSize: 16, color: '#D9D0C3', marginTop: 16, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Your customers left you hundreds of reviews. Let Repute turn them into your most powerful sales tool.
        </p>

        <div style={{ maxWidth: 560, margin: '36px auto 0' }}>
          <input
            id="cta-maps-link"
            name="cta-maps-link"
            type="text"
            placeholder="Paste your Google Maps link"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{
              width: '100%',
              height: 52,
              background: '#FFFFFF',
              border: '1.5px solid #D9D0C3',
              borderRadius: 10,
              padding: '0 16px',
              fontSize: 15,
              outline: 'none',
              color: '#1A1A1A',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#E8A000')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D9D0C3')}
          />
          <button
            onClick={onGenerate}
            disabled={loading || !urlInput.trim()}
            style={{
              width: '100%',
              height: 52,
              background: loading ? '#CC8400' : '#E8A000',
              color: '#1A1A1A',
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              border: 'none',
              cursor: loading || !urlInput.trim() ? 'not-allowed' : 'pointer',
              marginTop: 12,
              opacity: !urlInput.trim() ? 0.6 : 1,
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { if (!loading && urlInput.trim()) e.currentTarget.style.background = '#CC8400' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#E8A000' }}
          >
            {loading ? 'Generating...' : 'Generate my website free'}
          </button>
          <p style={{ fontSize: 13, color: '#5C5C5C', marginTop: 12 }}>
            Free during beta. Bengaluru businesses first. More cities coming.
          </p>
        </div>
      </div>
    </section>
  )
}
