'use client'

import React from 'react'

const steps = [
  {
    num: '01',
    title: 'Paste your Google Maps link',
    desc: 'Find your business on Google Maps. Copy the URL. Paste it into Repute. That is the only thing you need to do.',
  },
  {
    num: '02',
    title: 'Repute reads your reputation',
    desc: 'Our AI reads every review, extracts real customer language, identifies your top reasons-to-choose, and pulls your actual photos.',
  },
  {
    num: '03',
    title: 'Your site goes live',
    desc: 'A complete one-page website is generated and deployed to a unique URL. Share it, link to it from Instagram, or add it to your Google Business profile.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: '#FAF7F2', padding: '80px 48px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
          Three steps. Zero effort.
        </h2>

        <div style={{ marginTop: 48 }}>
          {steps.map((step, i) => (
            <div key={step.num}>
              <div className="flex items-start" style={{ gap: 32, padding: '32px 0' }}>
                {/* Watermark number */}
                <span className="hidden md:block select-none flex-shrink-0" style={{ fontSize: 72, fontWeight: 700, color: '#E8A000', opacity: 0.15, lineHeight: 1, minWidth: 90 }}>{step.num}</span>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: '#5C5C5C', lineHeight: 1.7, maxWidth: 560 }}>{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div style={{ height: 1, background: '#D9D0C3' }} />}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#A09888', marginTop: 32 }}>
          Currently available for businesses listed on Google Maps in Bengaluru. Mumbai, Delhi, Chennai, and Hyderabad launching next.
        </p>
      </div>
    </section>
  )
}
