'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="py-8 px-5 md:px-10" style={{ borderTop: '1px solid rgba(104,92,74,0.1)' }}>
      <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-4" style={{ maxWidth: 1360 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.42)' }}>
          &copy; 2026 Repute
        </span>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.42)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.55)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.42)' }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
