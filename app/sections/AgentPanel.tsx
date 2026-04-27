'use client'

import React from 'react'
import { HiCheck, HiX, HiExternalLink } from 'react-icons/hi'

export type AgentStatus = 'pending' | 'running' | 'complete' | 'failed'

export interface AgentState {
  status: AgentStatus
  statusMessage: string
  data: Record<string, unknown> | null
}

export interface AgentPanelProps {
  visible: boolean
  agents: Record<string, AgentState>
  businessName: string
  elapsedSeconds: number
  allComplete: boolean
  totalReviews: number
  totalPatterns: number
  liveUrl: string
  onReset: () => void
  copyData: Record<string, unknown> | null
  htmlContent?: string
  pipelineError?: string
}

const AGENT_META = [
  { key: 'reviewAggregator', name: 'Review Aggregator', id: '69ec79b5c0e9cbb13825fcbf' },
  { key: 'jtbdExtractor', name: 'JTBD Pattern Extractor', id: '69ec79d69b080e9c2b046fa1' },
  { key: 'copyGenerator', name: 'Copy Generator', id: '69ec79d6b4c5ebc92bce100a' },
  { key: 'deploymentAgent', name: 'Deployment Agent', id: '69ec79e9e36384f4e7472f90' },
]

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === 'complete') {
    return (
      <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: '50%', background: '#3A7D44' }}>
        <HiCheck size={20} color="white" />
      </div>
    )
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: '50%', background: '#E07856' }}>
        <HiX size={20} color="white" />
      </div>
    )
  }
  if (status === 'running') {
    return (
      <div className="relative flex items-center justify-center" style={{ width: 40, height: 40 }}>
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 32,
            height: 32,
            top: 4,
            left: 4,
            background: '#E07856',
            opacity: 0.2,
          }}
        />
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#E07856' }} />
      </div>
    )
  }
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.42)' }}
    />
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getReviews(data: Record<string, unknown> | null): unknown[] {
  if (!data) return []
  if (Array.isArray(data.reviews)) return data.reviews
  if (Array.isArray(data.review_list)) return data.review_list
  if (Array.isArray(data.data)) return data.data
  return []
}

function getPatterns(data: Record<string, unknown> | null): unknown[] {
  if (!data) return []
  if (Array.isArray(data.patterns)) return data.patterns
  if (Array.isArray(data.jtbd_reasons)) return data.jtbd_reasons
  if (Array.isArray(data.jtbd_patterns)) return data.jtbd_patterns
  if (Array.isArray(data.reasons)) return data.reasons
  if (Array.isArray(data.insights)) return data.insights
  return []
}

function getPatternText(p: Record<string, unknown>): string {
  if (typeof p?.pattern_text === 'string') return p.pattern_text
  if (typeof p?.text === 'string') return p.text
  if (typeof p?.reason === 'string') return p.reason
  if (typeof p?.insight === 'string') return p.insight
  if (typeof p?.description === 'string') return p.description
  if (typeof p?.name === 'string') return p.name
  if (typeof p?.title === 'string') return p.title
  return ''
}

function ReviewSnippets({ data }: { data: Record<string, unknown> | null }) {
  const reviews = getReviews(data)
  const total = typeof data?.total_review_count === 'number' ? data.total_review_count : (typeof data?.review_count === 'number' ? data.review_count : reviews.length)
  const avgRating = typeof data?.average_rating === 'number' ? data.average_rating : 0
  const biz = typeof data?.business_name === 'string' && data.business_name.trim() ? data.business_name : ''
  const category = typeof data?.category === 'string' && data.category.trim() ? data.category : ''
  if (total === 0 && reviews.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <span
        className="inline-block px-3 py-1"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          color: 'rgba(0,0,0,0.55)',
          background: 'rgba(104,92,74,0.08)',
          borderRadius: 12,
        }}
      >
        {total || reviews.length} reviews read
      </span>
      {avgRating > 0 && (
        <span
          className="inline-block px-3 py-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(0,0,0,0.55)',
            background: 'rgba(104,92,74,0.08)',
            borderRadius: 12,
          }}
        >
          {avgRating.toFixed(1)} avg rating
        </span>
      )}
      {category && (
        <span
          className="inline-block px-3 py-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(0,0,0,0.55)',
            background: 'rgba(104,92,74,0.08)',
            borderRadius: 12,
          }}
        >
          {category}
        </span>
      )}
    </div>
  )
}

function PatternChips({ data }: { data: Record<string, unknown> | null }) {
  const patterns = getPatterns(data) as Array<Record<string, unknown>>
  if (patterns.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {patterns.slice(0, 5).map((p, i) => {
        const text = getPatternText(p)
        if (!text) return null
        return (
          <span
            key={i}
            className="inline-block px-3 py-1"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'rgba(0,0,0,0.7)',
              background: 'rgba(104,92,74,0.08)',
              borderRadius: 12,
            }}
          >
            {i + 1}. {text}
          </span>
        )
      })}
    </div>
  )
}

function getVpTitle(vp: Record<string, unknown>): string {
  if (typeof vp?.title === 'string') return vp.title
  if (typeof vp?.heading === 'string') return vp.heading
  if (typeof vp?.name === 'string') return vp.name
  if (typeof vp?.label === 'string') return vp.label
  return ''
}

function getVpDescription(vp: Record<string, unknown>): string {
  if (typeof vp?.description === 'string') return vp.description
  if (typeof vp?.text === 'string') return vp.text
  if (typeof vp?.detail === 'string') return vp.detail
  if (typeof vp?.body === 'string') return vp.body
  return ''
}

function MiniPreview({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null
  const headline = typeof data?.hero_headline === 'string' ? data.hero_headline : (typeof data?.headline === 'string' ? data.headline : '')
  const subtitle = typeof data?.hero_subtitle === 'string' ? data.hero_subtitle : (typeof data?.subtitle === 'string' ? data.subtitle : '')
  const vps = Array.isArray(data?.value_props) ? data.value_props as Array<Record<string, unknown>> : (Array.isArray(data?.value_propositions) ? data.value_propositions as Array<Record<string, unknown>> : [])
  const cta = typeof data?.cta_text === 'string' ? data.cta_text : (typeof data?.cta === 'string' ? data.cta : '')

  if (!headline && !subtitle && vps.length === 0) return null

  return (
    <div
      className="mt-3 p-4 overflow-hidden"
      style={{
        maxWidth: 280,
        background: 'white',
        border: '1px solid rgba(104,92,74,0.12)',
        borderRadius: 12,
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {headline && (
        <div style={{ fontFamily: 'var(--font-lora), Georgia, serif', fontWeight: 400, fontSize: 14, marginBottom: 4, color: '#1A1A1A' }}>
          {headline}
        </div>
      )}
      {subtitle && <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 8 }}>{subtitle}</div>}
      {vps.slice(0, 2).map((vp, i) => {
        const title = getVpTitle(vp)
        const desc = getVpDescription(vp)
        if (!title && !desc) return null
        return (
          <div key={i} className="mb-1">
            {title && <span style={{ fontWeight: 600, fontSize: 10 }}>{title}</span>}
            {desc && <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', marginLeft: title ? 4 : 0 }}>{desc}</span>}
          </div>
        )
      })}
      {cta && (
        <div
          className="mt-2 text-center py-1"
          style={{ background: '#1A1A1A', color: 'white', borderRadius: 4, fontSize: 10 }}
        >
          {cta}
        </div>
      )}
    </div>
  )
}

function LiveUrlCard({ url }: { url: string }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center gap-2 p-3 transition-all duration-200 hover:shadow-md"
      style={{
        background: 'white',
        border: '1px solid rgba(104,92,74,0.18)',
        borderRadius: 12,
        textDecoration: 'none',
        maxWidth: 300,
      }}
    >
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{url}</span>
      <HiExternalLink size={14} color="rgba(0,0,0,0.42)" />
    </a>
  )
}

function WebsitePreview({ htmlContent, businessName }: { htmlContent: string; businessName: string }) {
  if (!htmlContent) return null

  const handleOpenInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(0,0,0,0.55)',
          }}
        >
          Generated Website Preview
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-80"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              padding: '6px 14px',
              background: '#1A1A1A',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            <HiExternalLink size={14} />
            Open Full Page
          </button>
        </div>
      </div>
      <div
        style={{
          border: '1px solid rgba(104,92,74,0.18)',
          borderRadius: 12,
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 4px 12px rgba(81,68,48,0.06)',
        }}
      >
        <iframe
          srcDoc={htmlContent}
          title="Generated Website Preview"
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: '100%',
            height: 600,
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

export default function AgentPanel({
  visible,
  agents,
  businessName,
  elapsedSeconds,
  allComplete,
  totalReviews,
  totalPatterns,
  liveUrl,
  onReset,
  copyData,
  htmlContent,
  pipelineError,
}: AgentPanelProps) {
  if (!visible) return null

  const hasFailed = Object.values(agents).some((a) => a.status === 'failed')

  return (
    <section className="px-5 md:px-10 pb-16">
      <div
        className="mx-auto"
        style={{
          maxWidth: 1360,
          transition: 'all 400ms ease-out',
        }}
      >
        {/* Error banner */}
        {hasFailed && pipelineError && (
          <div
            className="mb-4 p-4 flex items-start gap-3"
            style={{
              background: 'rgba(224,120,86,0.08)',
              border: '1px solid rgba(224,120,86,0.3)',
              borderRadius: 12,
            }}
          >
            <HiX size={18} color="#E07856" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 4 }}>
                Something went wrong
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>
                {pipelineError}
              </p>
            </div>
            <button
              onClick={onReset}
              className="flex-shrink-0 transition-opacity hover:opacity-80"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                padding: '6px 14px',
                background: '#1A1A1A',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary state */}
        {allComplete ? (
          <div
            className="p-6 md:p-8"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(104,92,74,0.18)',
              borderRadius: 16,
              boxShadow: '0 8px 20px rgba(81,68,48,0.08)',
            }}
          >
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.55)', marginBottom: 16 }}>
              Generated in {formatTime(elapsedSeconds)}. Read {totalReviews} reviews. Found {totalPatterns} patterns.
              {liveUrl && (
                <>
                  {' '}Live at{' '}
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A1A', fontWeight: 500 }}>
                    {liveUrl}
                  </a>
                  .
                </>
              )}
            </p>

            {/* Mini preview of generated copy */}
            {!htmlContent && <MiniPreview data={copyData} />}

            {/* Full website preview iframe */}
            {htmlContent && <WebsitePreview htmlContent={htmlContent} businessName={businessName} />}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-90"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 16,
                    fontWeight: 500,
                    height: 50,
                    padding: '0 24px',
                    background: '#1A1A1A',
                    color: 'white',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  Visit live site <HiExternalLink size={16} />
                </a>
              )}
              <button
                onClick={onReset}
                className="transition-opacity duration-200 hover:opacity-80"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  fontWeight: 500,
                  height: 50,
                  padding: '0 24px',
                  background: liveUrl ? 'transparent' : '#1A1A1A',
                  color: liveUrl ? '#1A1A1A' : 'white',
                  border: liveUrl ? '1px solid #D9D9D9' : 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Generate another
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-6 md:p-8"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(104,92,74,0.18)',
              borderRadius: 16,
              boxShadow: '0 8px 20px rgba(81,68,48,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(0,0,0,0.55)',
                }}
              >
                GENERATING YOUR WEBSITE
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(0,0,0,0.42)' }}>
                {formatTime(elapsedSeconds)} elapsed
              </span>
            </div>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, color: '#1A1A1A', marginBottom: 24 }}>
              {businessName ? `Reading reviews for ${businessName}` : (
                <span className="inline-block rounded" style={{ background: 'rgba(104,92,74,0.1)', width: 240, height: 24 }} />
              )}
            </p>

            {/* Agent rows */}
            <div className="space-y-4">
              {AGENT_META.map((meta) => {
                const agent = agents[meta.key] ?? { status: 'pending' as AgentStatus, statusMessage: 'Waiting', data: null }
                return (
                  <div key={meta.key} className="flex items-start gap-4">
                    <StatusIcon status={agent.status} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, color: '#1A1A1A' }}>
                        {meta.name}
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.55)' }}>
                        {agent.statusMessage}
                      </div>

                      {/* Streaming output per agent */}
                      {meta.key === 'reviewAggregator' && agent.status === 'complete' && (
                        <ReviewSnippets data={agent.data} />
                      )}
                      {meta.key === 'jtbdExtractor' && agent.status === 'complete' && (
                        <PatternChips data={agent.data} />
                      )}
                      {meta.key === 'copyGenerator' && agent.status === 'complete' && (
                        <MiniPreview data={agent.data} />
                      )}
                      {meta.key === 'deploymentAgent' && agent.status === 'complete' && (
                        <LiveUrlCard url={typeof agent.data?.live_url === 'string' ? agent.data.live_url : ''} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
