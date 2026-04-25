'use client'

import React from 'react'

const CITIES = ['Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Jaipur', 'Dubai', 'Riyadh', 'Istanbul']

export default function RegionalMap() {
  return (
    <section className="px-5 md:px-10 py-8">
      <div className="mx-auto" style={{ maxWidth: 1360 }}>
        <div
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 py-4"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: 'rgba(0,0,0,0.42)',
          }}
        >
          <span style={{ marginRight: 8 }}>
            Live in 8 cities across India, MENA, and Southeast Asia
          </span>
          {CITIES.map((city, i) => (
            <React.Fragment key={city}>
              <span style={{ color: 'rgba(0,0,0,0.5)' }}>{city}</span>
              {i < CITIES.length - 1 && (
                <span style={{ color: 'rgba(0,0,0,0.18)', margin: '0 2px' }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
