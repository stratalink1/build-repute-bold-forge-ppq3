'use client'

import React from 'react'

const SHOWCASE_ITEMS = [
  { name: 'Sharma Sweets', desc: 'Family halwai with ghee-laden mawa jalebi made fresh every morning', city: 'Mumbai, India', color: '#E8A000', slug: 'sharma-sweets', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop&q=80' },
  { name: 'Wellness Dental', desc: 'Dental clinic where the dentist explains every step before doing it', city: 'Bengaluru, India', color: '#E07856', slug: 'wellness-dental', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop&q=80' },
  { name: 'Orfali Bros', desc: 'Michelin-starred bistro where the chef visits every table and tells the story behind each dish', city: 'Dubai, UAE', color: '#7A9E7E', slug: 'orfali-bros', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&q=80' },
  { name: 'Najd Cafe', desc: 'Speciality coffee with a quiet upstairs floor locals book for long study sessions', city: 'Riyadh, Saudi Arabia', color: '#C4785B', slug: 'najd-cafe', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80' },
  { name: 'Iyengar Yoga Pune', desc: 'Traditional studio where students return for the senior teacher\'s alignment corrections', city: 'Pune, India', color: '#E8A000', slug: 'iyengar-yoga-pune', image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop&q=80' },
  { name: 'Mikla', desc: 'Rooftop restaurant with panoramic Istanbul views and modern Anatolian tasting menus', city: 'Istanbul, Turkey', color: '#E07856', slug: 'mikla', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80' },
  { name: 'Jaipur Block Print Co', desc: 'Hand-block-printed clothing store with an organic cafe on the same property', city: 'Jaipur, India', color: '#7A9E7E', slug: 'jaipur-block-print-co', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop&q=80' },
  { name: 'Hyderabad UPSC Academy', desc: 'Civil services coaching where students return for one mentor\'s prelims strategy', city: 'Hyderabad, India', color: '#C4785B', slug: 'hyderabad-upsc-academy', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&q=80' },
]

export default function ShowcaseGrid() {
  return (
    <section className="py-16 md:py-24 px-5 md:px-10">
      <div className="mx-auto" style={{ maxWidth: 1360 }}>
        <h3
          className="text-xl md:text-2xl mb-2"
          style={{ fontFamily: 'var(--font-lora), Georgia, serif', fontWeight: 500, color: 'rgba(0,0,0,0.9)' }}
        >
          Real websites Repute generated
        </h3>
        <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: 'rgba(0,0,0,0.55)', lineHeight: 1.5 }}>
          Each one was built from the business's own reviews. The copy uses the words their customers used.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOWCASE_ITEMS.map((item) => (
            <a
              key={item.name}
              href={`https://${item.slug}.repute.site`}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all duration-200 hover:shadow-lg group"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(104,92,74,0.18)',
                borderRadius: 16,
                boxShadow: '0 8px 20px rgba(81,68,48,0.08)',
                textDecoration: 'none',
                overflow: 'hidden',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Thumbnail image */}
              <div
                style={{
                  width: '100%',
                  paddingBottom: '62.5%',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}11 100%)`,
                  borderBottom: '1px solid rgba(104,92,74,0.08)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.image}
                  alt={`${item.name} website preview`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="absolute inset-0 flex-col items-center justify-center"
                  style={{ padding: 16, display: 'none' }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 20, color: 'white' }}>
                      {item.name[0]}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Website preview
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.9)' }}>
                  {item.name}
                </div>
                <div
                  className="mt-0.5"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.42)' }}
                >
                  {item.city}
                </div>
                <p
                  className="mt-1.5 line-clamp-2"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.55)', lineHeight: 1.5, margin: '6px 0 0' }}
                >
                  {item.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
