'use client'

import React from 'react'

export default function Header() {
  return (
    <header className="w-full" style={{ borderBottom: '1px solid rgba(104,92,74,0.08)' }}>
      <div className="mx-auto flex items-center justify-between px-5 md:px-10 py-4" style={{ maxWidth: 1360 }}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2C14 2 5 10 5 16a9 9 0 0018 0C23 10 14 2 14 2z" fill="#E8A000" />
            <text x="14" y="20" textAnchor="middle" fill="white" fontWeight="700" fontSize="12" fontFamily="Inter, sans-serif">R</text>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Repute</span>
        </div>

        {/* Spacer to keep logo left-aligned */}
        <div />
      </div>
    </header>
  )
}
