'use client'

import React from 'react'
import { IoStar } from 'react-icons/io5'

const testimonials = [
  {
    quote: 'I had no idea my customers were mentioning our filter coffee and free second refill in every review. Repute made that the headline. Footfall went up within a week.',
    attribution: 'Ravi M. \u2014 Darshini Restaurant, Basavanagudi',
  },
  {
    quote: 'We have 340 Google reviews and zero website. Repute turned three years of customer feedback into a page I am actually proud to share.',
    attribution: 'Priya K. \u2014 Bloom Hair Studio, HSR Layout',
  },
  {
    quote: 'My clinic has reviews going back five years. Repute found that patients always mention no waiting time and explains clearly. That is now my entire homepage.',
    attribution: 'Dr. Suresh N. \u2014 Koramangala Physio Clinic',
  },
]

export default function SocialProof() {
  return (
    <section style={{ background: '#FFFFFF', padding: '80px 48px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', textAlign: 'center' }}>
          Bengaluru trusted us first.
        </h2>
        <p style={{ fontSize: 15, color: '#5C5C5C', textAlign: 'center', marginTop: 8 }}>
          Real reviews. Real businesses. Real results.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24, marginTop: 48 }}>
          {testimonials.map((t) => (
            <div key={t.attribution} style={{ background: '#FAF7F2', border: '1px solid #D9D0C3', borderRadius: 12, padding: 28 }}>
              <div className="flex" style={{ gap: 2, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <IoStar key={n} size={14} color="#E8A000" />
                ))}
              </div>
              <p style={{ fontSize: 15, color: '#1A1A1A', fontStyle: 'italic', lineHeight: 1.6 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#5C5C5C', marginTop: 16 }}>
                {t.attribution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
