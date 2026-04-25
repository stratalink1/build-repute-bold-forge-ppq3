'use client'

import React, { useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'

interface NavbarProps {
  isAuthenticated: boolean
  onLogin: () => void
  onDashboard: () => void
}

function ReputeLogo({ iconSize = 28, dark = false }: { iconSize?: number; dark?: boolean }) {
  const textColor = dark ? '#FFFFFF' : '#1A1A1A'
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <svg width={iconSize} height={Math.round(iconSize * 1.3)} viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id={`r-cutout-${dark ? 'd' : 'l'}`}>
            <rect width="28" height="36" fill="white" />
            <text x="14" y="19" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Inter, sans-serif" fill="black">R</text>
          </mask>
        </defs>
        <path d="M14 0C6.268 0 0 6.268 0 14c0 9.5 14 22 14 22s14-12.5 14-22C28 6.268 21.732 0 14 0z" fill="#E8A000" mask={`url(#r-cutout-${dark ? 'd' : 'l'})`} />
      </svg>
      <span style={{ color: textColor, fontWeight: 700, fontSize: iconSize === 28 ? 20 : 18, fontFamily: 'Inter, sans-serif' }}>Repute</span>
    </div>
  )
}

export { ReputeLogo }

export default function Navbar({ isAuthenticated, onLogin, onDashboard }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50" style={{ background: '#FAF7F2', borderBottom: '1px solid #D9D0C3', height: 64 }}>
      <div className="flex items-center justify-between h-full" style={{ paddingLeft: 48, paddingRight: 48, maxWidth: 1280, margin: '0 auto' }}>
        <ReputeLogo />

        {/* Desktop links */}
        <div className="hidden md:flex items-center" style={{ gap: 24 }}>
          <a href="#how-it-works" style={{ color: '#5C5C5C', fontSize: 14, transition: 'color 150ms' }} className="hover:!text-[#1A1A1A]">How it works</a>
          <a href="#features" style={{ color: '#5C5C5C', fontSize: 14, transition: 'color 150ms' }} className="hover:!text-[#1A1A1A]">For businesses</a>

          {!isAuthenticated ? (
            <>
              <button onClick={onLogin} style={{ border: '1px solid #1A1A1A', color: '#1A1A1A', fontWeight: 500, fontSize: 14, borderRadius: 8, padding: '8px 12px', background: 'transparent', cursor: 'pointer', transition: 'background 150ms' }}>Log in</button>
              <button onClick={onLogin} style={{ background: '#E8A000', color: '#1A1A1A', fontWeight: 600, fontSize: 14, borderRadius: 8, padding: '8px 12px', border: 'none', cursor: 'pointer', transition: 'background 150ms' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#CC8400')} onMouseLeave={(e) => (e.currentTarget.style.background = '#E8A000')}>Try free</button>
            </>
          ) : (
            <button onClick={onDashboard} style={{ background: '#E8A000', color: '#1A1A1A', fontWeight: 600, fontSize: 14, borderRadius: 8, padding: '8px 12px', border: 'none', cursor: 'pointer', transition: 'background 150ms' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#CC8400')} onMouseLeave={(e) => (e.currentTarget.style.background = '#E8A000')}>Dashboard</button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {mobileOpen ? <HiOutlineX size={24} color="#1A1A1A" /> : <HiOutlineMenu size={24} color="#1A1A1A" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: '#FAF7F2', borderBottom: '1px solid #D9D0C3', padding: '16px 20px' }}>
          <div className="flex flex-col" style={{ gap: 16 }}>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ color: '#5C5C5C', fontSize: 14 }}>How it works</a>
            <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: '#5C5C5C', fontSize: 14 }}>For businesses</a>
            {!isAuthenticated ? (
              <>
                <button onClick={() => { onLogin(); setMobileOpen(false) }} style={{ border: '1px solid #1A1A1A', color: '#1A1A1A', fontWeight: 500, fontSize: 14, borderRadius: 8, padding: '8px 12px', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>Log in</button>
                <button onClick={() => { onLogin(); setMobileOpen(false) }} style={{ background: '#E8A000', color: '#1A1A1A', fontWeight: 600, fontSize: 14, borderRadius: 8, padding: '8px 12px', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Try free</button>
              </>
            ) : (
              <button onClick={() => { onDashboard(); setMobileOpen(false) }} style={{ background: '#E8A000', color: '#1A1A1A', fontWeight: 600, fontSize: 14, borderRadius: 8, padding: '8px 12px', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Dashboard</button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
