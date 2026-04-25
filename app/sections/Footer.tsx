'use client'

import React from 'react'

interface ProofItem {
  number: string
  label: string
}

const PROOF: ProofItem[] = [
  { number: '8', label: 'live sites across India and MENA' },
  { number: '3', label: 'templates picked by business type' },
  { number: '6', label: 'review platforms supported' },
]

export default function Footer() {
  return (
    <footer className="px-5 md:px-10 pt-16 pb-10" style={{ borderTop: '1px solid rgba(104,92,74,0.1)' }}>
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        {/* Proof row */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 pb-12"
          style={{ borderBottom: '1px solid rgba(104,92,74,0.08)' }}
        >
          {PROOF.map((p) => (
            <div key={p.label}>
              <div
                style={{
                  fontFamily: 'var(--font-lora), Georgia, serif',
                  fontWeight: 400,
                  fontSize: 36,
                  lineHeight: 1,
                  color: 'rgba(0,0,0,0.9)',
                  letterSpacing: -1,
                }}
              >
                {p.number}
              </div>
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.55)',
                  lineHeight: 1.5,
                  marginTop: 6,
                  maxWidth: 260,
                }}
              >
                {p.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8"
        >
          <div className="flex flex-col gap-1">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              &copy; 2026 Repute
            </span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: 'Templates', href: '#templates' },
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
              { label: 'Contact', href: 'mailto:hello@repute.site' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors duration-200"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.55)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(0,0,0,0.9)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(0,0,0,0.55)'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
