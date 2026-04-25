'use client'

import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineArrowSmRight, HiOutlineArrowLeft, HiOutlineArrowRight } from 'react-icons/hi'
import { getTemplate } from '@/lib/templates'
import type { BusinessType, LayoutVariant } from '@/lib/templates'

/**
 * One slide = one template category currently in production.
 * Three categories shown for now (food, health, education). The other three
 * templates exist in lib/templates.ts but stay off the slider until we have
 * real generated example sites in those categories.
 */
interface Slide {
  type: BusinessType
  variant: LayoutVariant
  example: {
    business: string
    city: string
    slug: string
    /** the reason-to-choose-driven hero headline for the mock */
    mockHeadline: string
    /** the reason-to-choose-driven sub-line for the mock */
    mockSub: string
    /** the CTA on the mock */
    mockCta: string
    accent: string
  }
}

const SLIDES: Slide[] = [
  {
    type: 'food_hospitality',
    variant: 'A',
    example: {
      business: 'Sharma Sweets',
      city: 'Mumbai, India',
      slug: 'sharma-sweets',
      mockHeadline: 'The mawa jalebi people queue for at 7am',
      mockSub: 'Family halwai, fourth generation. Ghee fresh every morning, sugar syrup made the way our grandfather did.',
      mockCta: 'Find the shop',
      accent: '#E8A000',
    },
  },
  {
    type: 'health_wellness',
    variant: 'B',
    example: {
      business: 'Wellness Dental',
      city: 'Bengaluru, India',
      slug: 'wellness-dental',
      mockHeadline: 'The dentist who explains every step before doing it',
      mockSub: 'Patients come back because they know what is happening, why it is happening, and what it costs, before any tool touches them.',
      mockCta: 'Book your first consult',
      accent: '#E07856',
    },
  },
  {
    type: 'education_coaching',
    variant: 'A',
    example: {
      business: 'Hyderabad UPSC Academy',
      city: 'Hyderabad, India',
      slug: 'hyderabad-upsc-academy',
      mockHeadline: 'The prelims strategy students keep coming back for',
      mockSub: 'One mentor. One method. Students who cracked it last year still drop in to thank him before the next batch starts.',
      mockCta: 'Sit in on a class',
      accent: '#7A9E7E',
    },
  },
]

const AUTO_ADVANCE_MS = 6000

export default function TemplateShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-advance loop, paused on hover/focus
  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length)
    }, AUTO_ADVANCE_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused])

  const goTo = (i: number) => setActiveIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  const prev = () => goTo(activeIndex - 1)
  const next = () => goTo(activeIndex + 1)

  return (
    <section
      id="templates"
      className="py-16 md:py-24 px-5 md:px-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        {/* Section header */}
        <div className="flex items-end justify-between gap-4 mb-2">
          <h2
            className="text-xl md:text-2xl"
            style={{
              fontFamily: 'var(--font-lora), Georgia, serif',
              fontWeight: 500,
              color: 'rgba(0,0,0,0.9)',
              letterSpacing: -0.4,
            }}
          >
            Picked by your business type, not by you
          </h2>
          <span
            className="hidden md:inline"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'rgba(0,0,0,0.42)',
            }}
          >
            {activeIndex + 1} / {SLIDES.length}
          </span>
        </div>
        <p
          className="mb-10"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            color: 'rgba(0,0,0,0.55)',
            lineHeight: 1.5,
            maxWidth: 640,
          }}
        >
          Three live templates so far. Each one chosen automatically from how your customers describe you in reviews.
        </p>

        {/* Slider stage */}
        <div
          className="relative"
          role="region"
          aria-label="Template examples"
          aria-live="polite"
        >
          {/* Track */}
          <div className="overflow-hidden" style={{ borderRadius: 20 }}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {SLIDES.map((slide) => (
                <div key={slide.type} className="flex-shrink-0 w-full">
                  <SlideCard slide={slide} />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose template">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.type}
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Go to ${getTemplate(slide.type).categoryLabel}`}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === activeIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 999,
                    background: i === activeIndex ? '#1A1A1A' : 'rgba(0,0,0,0.18)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <IconButton onClick={prev} ariaLabel="Previous template">
                <HiOutlineArrowLeft size={16} />
              </IconButton>
              <IconButton onClick={next} ariaLabel="Next template">
                <HiOutlineArrowRight size={16} />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p
          className="mt-10 text-center"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'rgba(0,0,0,0.42)',
          }}
        >
          More templates coming as we onboard restaurants, retail, professional services, and venues.
        </p>
      </div>
    </section>
  )
}

function IconButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        background: 'white',
        border: '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'rgba(0,0,0,0.7)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </button>
  )
}

function SlideCard({ slide }: { slide: Slide }) {
  const template = getTemplate(slide.type)
  const variant = template.variants[slide.variant]
  const liveUrl = `https://${slide.example.slug}.repute.site`

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid rgba(104,92,74,0.18)',
        borderRadius: 20,
        padding: '32px 32px 28px',
        boxShadow: '0 8px 30px rgba(81,68,48,0.08)',
      }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12"
    >
      {/* Left: meta + pickedWhen */}
      <div className="flex flex-col">
        <div className="mb-6">
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: slide.example.accent,
              background: `${slide.example.accent}14`,
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            {template.categoryLabel}
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-lora), Georgia, serif',
            fontWeight: 500,
            fontSize: 24,
            lineHeight: 1.2,
            color: 'rgba(0,0,0,0.9)',
            margin: '0 0 6px',
          }}
        >
          {slide.example.business}
        </h3>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: 'rgba(0,0,0,0.42)',
            marginBottom: 24,
          }}
        >
          {slide.example.city}
        </div>

        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(0,0,0,0.42)',
            marginBottom: 8,
          }}
        >
          Why this template was picked
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            lineHeight: 1.55,
            color: 'rgba(0,0,0,0.7)',
            margin: 0,
          }}
        >
          {variant.pickedWhen}
        </p>

        <div className="mt-auto pt-8">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: '#1A1A1A',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.2)',
              paddingBottom: 2,
              width: 'fit-content',
            }}
          >
            View live site
            <HiOutlineArrowSmRight size={18} />
          </a>
        </div>
      </div>

      {/* Right: stylised mini-page mock */}
      <div
        style={{
          background: '#FAF7F2',
          borderRadius: 14,
          padding: '28px 28px 32px',
          border: '1px solid rgba(104,92,74,0.12)',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Browser chrome dots, just a visual cue this is a website */}
        <div className="flex items-center gap-1.5 mb-6" aria-hidden>
          {['#F87171', '#FBBF24', '#34D399'].map((c) => (
            <span key={c} style={{ width: 8, height: 8, borderRadius: 999, background: c, opacity: 0.55 }} />
          ))}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-lora), Georgia, serif',
            fontWeight: 400,
            fontSize: 26,
            lineHeight: 1.2,
            color: 'rgba(0,0,0,0.9)',
            marginBottom: 14,
            letterSpacing: -0.4,
          }}
        >
          {slide.example.mockHeadline}
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'rgba(0,0,0,0.55)',
            margin: '0 0 22px',
          }}
        >
          {slide.example.mockSub}
        </p>

        <div className="mt-auto">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: 'white',
              background: '#1A1A1A',
              padding: '10px 16px',
              borderRadius: 8,
            }}
          >
            {slide.example.mockCta}
            <HiOutlineArrowSmRight size={16} />
          </span>
        </div>
      </div>
    </div>
  )
}
