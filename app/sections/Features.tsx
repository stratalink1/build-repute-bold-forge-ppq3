'use client'

import React from 'react'

const features = [
  {
    title: 'Review intelligence',
    desc: 'We read every review on your Google Maps profile and find the patterns \u2014 what customers say, how they say it, and what keeps them coming back.',
  },
  {
    title: 'Jobs to Be Done analysis',
    desc: 'We apply the same framework billion-dollar companies use to understand customers. Automatically. Your site speaks to what people are actually hiring you for.',
  },
  {
    title: 'Live in 60 seconds',
    desc: 'One input. One URL. Your site is live, indexed, and ready to share before your next customer walks in the door.',
  },
]

export default function Features() {
  return (
    <section id="features" style={{ background: '#FFFFFF', padding: '80px 48px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.2 }}>
          Not a website builder. A reputation engine.
        </h2>
        <p style={{ fontSize: 16, color: '#5C5C5C', textAlign: 'center', marginTop: 12, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Built ground-up for Indian local businesses. Not adapted. Built for.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24, marginTop: 48 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: '#FFFFFF', border: '1px solid #D9D0C3', borderRadius: 12, padding: 32, position: 'relative' }}>
              {/* Accent bar */}
              <div style={{ position: 'absolute', left: 0, top: 24, width: 3, height: 24, background: '#E8A000', borderRadius: '0 2px 2px 0' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#5C5C5C', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
