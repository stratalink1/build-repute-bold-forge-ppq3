'use client'

import React, { useEffect, useState } from 'react'

export default function Globe() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div className="w-full aspect-square max-w-[420px] rounded-full" style={{ background: '#FAF7F2' }} />
  }

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto">
      {/* Sphere */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FAF7F2 40%, #E8E2D8 75%, #D9D0C3 100%)',
        boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Globe rotation container */}
        <div className="absolute inset-0 rounded-full overflow-hidden globe-rotate">
          {/* India SVG overlay */}
          <svg viewBox="0 0 420 420" className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* India outline - positioned center-right of globe */}
            <g transform="translate(145, 100) scale(0.55)">
              {/* Simplified India shape */}
              <path d="M120 20 L145 15 L170 18 L195 10 L220 15 L240 30 L250 50 L255 75 L248 95 L255 110 L260 130 L255 155 L245 175 L250 195 L242 218 L230 240 L218 258 L205 275 L192 288 L178 295 L168 285 L155 278 L145 265 L132 248 L118 228 L108 210 L100 188 L95 168 L90 148 L88 128 L92 108 L98 88 L105 68 L112 48 L118 30 Z" stroke="#E8A000" strokeWidth="2" fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(232,160,0,0.4))' }} />
              {/* Kashmir detail */}
              <path d="M120 20 L110 8 L125 5 L140 8 L145 15" stroke="#E8A000" strokeWidth="1.5" fill="none" />
              {/* Northeast detail */}
              <path d="M255 75 L270 70 L278 80 L272 92 L260 95 L255 90" stroke="#E8A000" strokeWidth="1.5" fill="none" />
              {/* Sri Lanka hint */}
              <ellipse cx="198" cy="310" rx="12" ry="16" stroke="#D9D0C3" strokeWidth="1" fill="none" />

              {/* Bengaluru dot - main */}
              <circle cx="178" cy="240" r="5" fill="#E8A000" />
              {/* Ripple */}
              <circle cx="178" cy="240" r="5" fill="none" stroke="#E8A000" strokeWidth="1.5" className="ripple-ring" />

              {/* Bengaluru label */}
              <text x="192" y="238" fill="#1A1A1A" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">Bengaluru</text>
              <text x="192" y="250" fill="#A09888" fontSize="9" fontFamily="Inter, sans-serif">We are here</text>

              {/* Mumbai */}
              <circle cx="108" cy="188" r="3.5" fill="#E8A000" opacity="0.35" />
              {/* Delhi */}
              <circle cx="148" cy="68" r="3.5" fill="#E8A000" opacity="0.35" />
              {/* Chennai */}
              <circle cx="198" cy="248" r="3.5" fill="#E8A000" opacity="0.35" />
              {/* Hyderabad */}
              <circle cx="168" cy="205" r="3.5" fill="#E8A000" opacity="0.35" />
            </g>
          </svg>
        </div>
      </div>

      {/* Subtle grid lines for globe feel */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 420 420" fill="none">
        {/* Latitude lines */}
        <ellipse cx="210" cy="140" rx="190" ry="30" stroke="#D9D0C3" strokeWidth="0.5" opacity="0.3" />
        <ellipse cx="210" cy="210" rx="200" ry="25" stroke="#D9D0C3" strokeWidth="0.5" opacity="0.3" />
        <ellipse cx="210" cy="280" rx="185" ry="28" stroke="#D9D0C3" strokeWidth="0.5" opacity="0.3" />
        {/* Longitude arcs */}
        <ellipse cx="210" cy="210" rx="30" ry="200" stroke="#D9D0C3" strokeWidth="0.5" opacity="0.2" />
        <ellipse cx="210" cy="210" rx="100" ry="200" stroke="#D9D0C3" strokeWidth="0.5" opacity="0.2" />
        <ellipse cx="210" cy="210" rx="160" ry="200" stroke="#D9D0C3" strokeWidth="0.5" opacity="0.15" />
      </svg>
    </div>
  )
}
