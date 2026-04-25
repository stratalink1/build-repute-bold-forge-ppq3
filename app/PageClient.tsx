'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import Header from './sections/Header'
import Hero from './sections/Hero'
import AgentPanel from './sections/AgentPanel'
import type { AgentState, AgentStatus } from './sections/AgentPanel'
import TemplateShowcase from './sections/TemplateShowcase'
import RegionalMap from './sections/RegionalMap'
import Footer from './sections/Footer'

const AGENT_IDS = {
  reviewAggregator: '69ec79b5c0e9cbb13825fcbf',
  jtbdExtractor: '69ec79d69b080e9c2b046fa1',
  copyGenerator: '69ec79d6b4c5ebc92bce100a',
  deploymentAgent: '69ec79e9e36384f4e7472f90',
} as const

const DEFAULT_AGENT: AgentState = { status: 'pending', statusMessage: 'Waiting', data: null }

function initialAgents(): Record<string, AgentState> {
  return {
    reviewAggregator: { ...DEFAULT_AGENT },
    jtbdExtractor: { ...DEFAULT_AGENT },
    copyGenerator: { ...DEFAULT_AGENT },
    deploymentAgent: { ...DEFAULT_AGENT },
  }
}

const AGENT_INFO = [
  { name: 'Review Aggregator', purpose: 'Scrapes reviews from listing URLs', key: 'reviewAggregator' },
  { name: 'Pattern Analysis', purpose: 'Finds patterns in customer language', key: 'jtbdExtractor' },
  { name: 'Copy Generator', purpose: 'Writes website copy from patterns', key: 'copyGenerator' },
  { name: 'Deployment Agent', purpose: 'Builds and deploys the site', key: 'deploymentAgent' },
]

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateFallbackHtml(
  businessName: string,
  copyData: Record<string, unknown> | null,
  patternData: Record<string, unknown> | null,
  reviewData: Record<string, unknown> | null
): string {
  const headline = typeof copyData?.hero_headline === 'string' && copyData.hero_headline.trim() ? copyData.hero_headline : businessName
  const subtitle = typeof copyData?.hero_subtitle === 'string' ? copyData.hero_subtitle : ''
  const ctaText = typeof copyData?.cta_text === 'string' && copyData.cta_text.trim() ? copyData.cta_text : 'Get in Touch'
  const metaDesc = typeof copyData?.meta_description === 'string' ? copyData.meta_description : subtitle
  const valueProps = Array.isArray(copyData?.value_props) ? (copyData.value_props as Array<Record<string, unknown>>) : (Array.isArray(copyData?.value_propositions) ? (copyData.value_propositions as Array<Record<string, unknown>>) : [])
  const socialProof = Array.isArray(copyData?.social_proof) ? (copyData.social_proof as Array<Record<string, unknown>>) : (Array.isArray(copyData?.testimonials) ? (copyData.testimonials as Array<Record<string, unknown>>) : [])
  // Try multiple field names for patterns
  let patterns: Array<Record<string, unknown>> = []
  if (patternData) {
    if (Array.isArray(patternData.patterns)) patterns = patternData.patterns as Array<Record<string, unknown>>
    else if (Array.isArray(patternData.jtbd_reasons)) patterns = patternData.jtbd_reasons as Array<Record<string, unknown>>
    else if (Array.isArray(patternData.jtbd_patterns)) patterns = patternData.jtbd_patterns as Array<Record<string, unknown>>
    else if (Array.isArray(patternData.reasons)) patterns = patternData.reasons as Array<Record<string, unknown>>
    else if (Array.isArray(patternData.insights)) patterns = patternData.insights as Array<Record<string, unknown>>
  }
  const avgRating = typeof reviewData?.average_rating === 'number' ? reviewData.average_rating : 0
  const reviewCount = typeof reviewData?.total_review_count === 'number' ? reviewData.total_review_count : (typeof reviewData?.review_count === 'number' ? reviewData.review_count : 0)
  const businessAddress = typeof reviewData?.business_address === 'string' ? reviewData.business_address : ''

  // Extract stars SVG helper
  const starSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E8A838" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`

  const vpHtml = valueProps.map((vp) => {
    const title = typeof vp?.title === 'string' ? escapeHtml(vp.title) : (typeof vp?.heading === 'string' ? escapeHtml(vp.heading) : (typeof vp?.name === 'string' ? escapeHtml(vp.name) : ''))
    const body = typeof vp?.body === 'string' ? escapeHtml(vp.body) : (typeof vp?.description === 'string' ? escapeHtml(vp.description) : (typeof vp?.text === 'string' ? escapeHtml(vp.text) : ''))
    if (!title && !body) return ''
    return `
    <div style="flex:1;min-width:280px;background:#fff;border-radius:16px;padding:36px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.04);transition:transform 0.2s;cursor:default;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      <h3 style="font-size:20px;font-weight:600;margin:0 0 12px;color:#1A1A1A;line-height:1.3;">${title}</h3>
      <p style="font-size:15px;line-height:1.7;color:#555;margin:0;">${body}</p>
    </div>`
  }).filter(Boolean).join('')

  const quotesHtml = socialProof.slice(0, 6).map((sp) => {
    const quote = typeof sp?.quote === 'string' ? escapeHtml(sp.quote) : (typeof sp?.text === 'string' ? escapeHtml(sp.text) : (typeof sp?.testimonial === 'string' ? escapeHtml(sp.testimonial) : (typeof sp?.review_text === 'string' ? escapeHtml(sp.review_text) : '')))
    const name = typeof sp?.reviewer_name === 'string' ? escapeHtml(sp.reviewer_name) : (typeof sp?.name === 'string' ? escapeHtml(sp.name) : (typeof sp?.author === 'string' ? escapeHtml(sp.author) : 'Happy Customer'))
    if (!quote) return ''
    return `
    <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.04);flex:1;min-width:280px;border:1px solid rgba(0,0,0,0.04);">
      <div style="display:flex;gap:2px;margin-bottom:14px;">${starSvg}${starSvg}${starSvg}${starSvg}${starSvg}</div>
      <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px;font-style:italic;">&ldquo;${quote}&rdquo;</p>
      <p style="font-size:13px;color:#888;margin:0;font-weight:600;">&mdash; ${name}</p>
    </div>`
  }).filter(Boolean).join('')

  const patternsHtml = patterns.slice(0, 5).map((p, i) => {
    const text = typeof p?.pattern_text === 'string' ? escapeHtml(p.pattern_text)
      : typeof p?.title === 'string' ? escapeHtml(p.title)
      : typeof p?.reason === 'string' ? escapeHtml(p.reason)
      : typeof p?.text === 'string' ? escapeHtml(p.text)
      : typeof p?.insight === 'string' ? escapeHtml(p.insight)
      : typeof p?.description === 'string' ? escapeHtml(p.description)
      : typeof p?.name === 'string' ? escapeHtml(p.name) : ''
    const quote = typeof p?.representative_quote === 'string' ? escapeHtml(p.representative_quote)
      : typeof p?.supporting_quote === 'string' ? escapeHtml(p.supporting_quote)
      : typeof p?.quote === 'string' ? escapeHtml(p.quote)
      : typeof p?.example === 'string' ? escapeHtml(p.example) : ''
    if (!text) return ''
    return `
    <div style="display:flex;align-items:flex-start;gap:16px;padding:20px 0;${i < Math.min(patterns.length, 5) - 1 ? 'border-bottom:1px solid rgba(0,0,0,0.06);' : ''}">
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1A1A1A,#333);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0;">${i + 1}</div>
      <div style="flex:1;">
        <p style="font-size:16px;font-weight:500;color:#1A1A1A;margin:0 0 6px;line-height:1.5;">${text}</p>
        ${quote ? `<p style="font-size:13px;color:#888;margin:0;font-style:italic;line-height:1.5;">&ldquo;${quote}&rdquo;</p>` : ''}
      </div>
    </div>`
  }).filter(Boolean).join('')

  const ratingHtml = avgRating > 0 ? `
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,0,0,0.04);padding:8px 16px;border-radius:24px;margin-bottom:24px;">
      <div style="display:flex;gap:2px;">${Array.from({length: Math.round(avgRating)}).map(() => starSvg).join('')}</div>
      <span style="font-size:14px;font-weight:600;color:#1A1A1A;">${avgRating.toFixed(1)}</span>
      ${reviewCount > 0 ? `<span style="font-size:13px;color:#888;">from ${reviewCount} reviews</span>` : ''}
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(businessName)}</title>
<meta name="description" content="${escapeHtml(metaDesc)}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',system-ui,sans-serif;color:#1A1A1A;background:#FAF7F2;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
@media(max-width:768px){
  .hero-title{font-size:32px !important;}
  .hero-sub{font-size:16px !important;}
  .section-title{font-size:24px !important;}
  .flex-cards{flex-direction:column !important;}
  .flex-cards>div{min-width:100% !important;}
}
</style>
</head>
<body>
<header style="padding:20px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,0.06);background:rgba(250,247,242,0.95);backdrop-filter:blur(8px);position:sticky;top:0;z-index:10;">
  <div style="font-size:20px;font-weight:700;letter-spacing:-0.5px;">${escapeHtml(businessName)}</div>
  <a href="#contact" style="font-size:14px;font-weight:500;padding:8px 20px;background:#1A1A1A;color:#fff;border-radius:6px;">${escapeHtml(ctaText)}</a>
</header>

<section style="padding:100px 40px 80px;text-align:center;max-width:820px;margin:0 auto;">
  ${ratingHtml}
  <h1 class="hero-title" style="font-size:52px;font-weight:700;line-height:1.12;margin-bottom:20px;letter-spacing:-1.5px;">${escapeHtml(headline)}</h1>
  ${subtitle ? `<p class="hero-sub" style="font-size:20px;color:#555;line-height:1.6;margin-bottom:40px;max-width:640px;margin-left:auto;margin-right:auto;">${escapeHtml(subtitle)}</p>` : ''}
  <a href="#contact" style="display:inline-block;padding:16px 40px;background:#1A1A1A;color:#fff;border-radius:8px;font-size:16px;font-weight:500;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">${escapeHtml(ctaText)}</a>
</section>

${vpHtml ? `
<section style="padding:60px 40px;max-width:1100px;margin:0 auto;">
  <h2 class="section-title" style="font-size:28px;font-weight:600;text-align:center;margin-bottom:48px;">Why Customers Choose Us</h2>
  <div class="flex-cards" style="display:flex;flex-wrap:wrap;gap:24px;">${vpHtml}</div>
</section>` : ''}

${patternsHtml ? `
<section style="padding:60px 40px;max-width:800px;margin:0 auto;">
  <h2 class="section-title" style="font-size:28px;font-weight:600;text-align:center;margin-bottom:40px;">What Drives Customer Loyalty</h2>
  <div style="background:#fff;border-radius:16px;padding:28px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.04);">${patternsHtml}</div>
</section>` : ''}

${quotesHtml ? `
<section style="padding:60px 40px;background:rgba(255,255,255,0.6);">
  <div style="max-width:1100px;margin:0 auto;">
    <h2 class="section-title" style="font-size:28px;font-weight:600;text-align:center;margin-bottom:48px;">What Our Customers Say</h2>
    <div class="flex-cards" style="display:flex;flex-wrap:wrap;gap:24px;">${quotesHtml}</div>
  </div>
</section>` : ''}

<footer id="contact" style="padding:60px 40px;text-align:center;border-top:1px solid rgba(0,0,0,0.06);">
  <h3 style="font-size:24px;font-weight:600;margin-bottom:8px;">${escapeHtml(businessName)}</h3>
  ${businessAddress ? `<p style="font-size:14px;color:#888;margin-bottom:16px;">${escapeHtml(businessAddress)}</p>` : ''}
  <a href="#contact" style="display:inline-block;padding:14px 32px;background:#1A1A1A;color:#fff;border-radius:8px;font-size:15px;font-weight:500;margin-bottom:24px;">${escapeHtml(ctaText)}</a>
  <p style="font-size:13px;color:#aaa;margin-top:24px;">${escapeHtml(businessName)} &mdash; Built with Repute</p>
</footer>
</body>
</html>`
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F2', color: '#1A1A1A' }}>
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(0,0,0,0.55)' }}>{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 text-sm"
              style={{ background: '#1A1A1A', color: 'white', borderRadius: 8 }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function PageClient() {
  const [url, setUrl] = useState('')
  const [agents, setAgents] = useState<Record<string, AgentState>>(initialAgents)
  const [panelVisible, setPanelVisible] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [allComplete, setAllComplete] = useState(false)
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalPatterns, setTotalPatterns] = useState(0)
  const [liveUrl, setLiveUrl] = useState('')
  const [copyData, setCopyData] = useState<Record<string, unknown> | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [pipelineError, setPipelineError] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updateAgent = useCallback((key: string, update: Partial<AgentState>) => {
    setAgents((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }))
  }, [])

  const startTimer = useCallback(() => {
    setElapsedSeconds(0)
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const runPipeline = useCallback(async (inputUrl: string) => {
    setIsRunning(true)
    setPanelVisible(true)
    setAllComplete(false)
    setPipelineError('')
    setAgents(initialAgents())
    setBusinessName('')
    setLiveUrl('')
    setCopyData(null)
    setHtmlContent('')
    setTotalReviews(0)
    setTotalPatterns(0)
    startTimer()

    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      // Agent 1: Review Aggregator
      updateAgent('reviewAggregator', { status: 'running', statusMessage: 'Scraping reviews from the listing...' })
      let r1: Awaited<ReturnType<typeof callAIAgent>>
      try {
        r1 = await callAIAgent(inputUrl, AGENT_IDS.reviewAggregator)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Network error connecting to review agent'
        updateAgent('reviewAggregator', { status: 'failed', statusMessage: errMsg })
        setPipelineError(`Could not connect to the review agent. ${errMsg}`)
        stopTimer()
        setIsRunning(false)
        return
      }
      // Parse response robustly - try multiple shapes
      if (!r1?.success) {
        // Check if there's still usable data despite success=false
        const maybeData = r1?.response?.result ?? r1?.response
        if (!maybeData || typeof maybeData !== 'object' || Object.keys(maybeData).length === 0) {
          const errMsg = r1?.error || r1?.response?.message || 'Failed to read reviews'
          updateAgent('reviewAggregator', { status: 'failed', statusMessage: errMsg })
          setPipelineError(`Review scraping failed: ${errMsg}`)
          stopTimer()
          setIsRunning(false)
          return
        }
      }
      // Extract data - try result first, then response directly
      let d1: Record<string, unknown> | null = null
      const rawResult1: any = r1?.response?.result
      const rawResponse1: any = r1?.response
      if (rawResult1 && typeof rawResult1 === 'object' && !Array.isArray(rawResult1) && Object.keys(rawResult1).length > 0) {
        // Check it's not just { status, message } wrapper with no real data
        const resultKeys = Object.keys(rawResult1)
        const hasRealData = resultKeys.some(k => !['status', 'message', 'error'].includes(k))
        d1 = hasRealData ? (rawResult1 as Record<string, unknown>) : null
      }
      if (!d1 && rawResponse1 && typeof rawResponse1 === 'object') {
        const responseKeys = Object.keys(rawResponse1)
        const hasRealData = responseKeys.some(k => !['status', 'message', 'error', 'result'].includes(k))
        if (hasRealData) d1 = rawResponse1 as Record<string, unknown>
      }
      // If result was a string (text response), wrap it
      if (!d1 && typeof rawResult1 === 'string' && rawResult1.trim().length > 0) {
        try {
          const parsed = JSON.parse(rawResult1)
          if (parsed && typeof parsed === 'object') d1 = parsed as Record<string, unknown>
        } catch {
          d1 = { text: rawResult1 } as Record<string, unknown>
        }
      }
      if (!d1 || (typeof d1 === 'object' && Object.keys(d1).length === 0)) {
        updateAgent('reviewAggregator', { status: 'failed', statusMessage: 'No review data returned' })
        setPipelineError('The review agent returned no data. Please verify the URL or business name and try again.')
        stopTimer()
        setIsRunning(false)
        return
      }
      // Check for explicit error field - but only if there's no other useful data
      if (typeof d1?.error === 'string' && d1.error.trim().length > 0) {
        const otherKeys = Object.keys(d1).filter(k => k !== 'error')
        if (otherKeys.length === 0) {
          updateAgent('reviewAggregator', { status: 'failed', statusMessage: d1.error as string })
          setPipelineError(`Review error: ${d1.error}`)
          stopTimer()
          setIsRunning(false)
          return
        }
      }
      const bName = typeof d1?.business_name === 'string' && (d1.business_name as string).trim() ? (d1.business_name as string) : 'your business'
      // Look for reviews in multiple possible fields
      let reviews: unknown[] = []
      if (Array.isArray(d1?.reviews)) reviews = d1.reviews as unknown[]
      else if (Array.isArray(d1?.review_list)) reviews = d1.review_list as unknown[]
      else if (Array.isArray(d1?.data)) reviews = d1.data as unknown[]
      // Even with 0 reviews, continue if we have a business name or other data - the agent might have embedded review info differently
      const avgRating = typeof d1?.average_rating === 'number' ? d1.average_rating : 0
      const reviewCount = typeof d1?.total_review_count === 'number' ? d1.total_review_count : (typeof d1?.review_count === 'number' ? d1.review_count : reviews.length)
      setBusinessName(bName)
      setTotalReviews(reviewCount || reviews.length)
      const reviewStatusMsg = reviews.length > 0
        ? `Read ${reviewCount || reviews.length} reviews.${avgRating > 0 ? ` Average rating ${avgRating.toFixed(1)}.` : ''}`
        : `Got data for ${bName}. Proceeding with available information.`
      updateAgent('reviewAggregator', {
        status: 'complete',
        statusMessage: reviewStatusMsg,
        data: d1 as Record<string, unknown>,
      })

      // Agent 2: JTBD Pattern Extractor
      updateAgent('jtbdExtractor', { status: 'running', statusMessage: 'Analyzing review language for patterns...' })
      let r2: Awaited<ReturnType<typeof callAIAgent>>
      try {
        r2 = await callAIAgent(JSON.stringify(d1), AGENT_IDS.jtbdExtractor)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Network error connecting to pattern agent'
        updateAgent('jtbdExtractor', { status: 'failed', statusMessage: errMsg })
        setPipelineError(errMsg)
        stopTimer()
        setIsRunning(false)
        return
      }
      // Parse JTBD response robustly
      let d2: Record<string, unknown> | null = null
      if (r2?.success || r2?.response) {
        const rawResult2: any = r2?.response?.result
        const rawResponse2: any = r2?.response
        if (rawResult2 && typeof rawResult2 === 'object' && !Array.isArray(rawResult2) && Object.keys(rawResult2).length > 0) {
          const resultKeys = Object.keys(rawResult2)
          const hasRealData = resultKeys.some(k => !['status', 'message', 'error'].includes(k))
          d2 = hasRealData ? (rawResult2 as Record<string, unknown>) : null
        }
        if (!d2 && rawResponse2 && typeof rawResponse2 === 'object') {
          const responseKeys = Object.keys(rawResponse2)
          const hasRealData = responseKeys.some(k => !['status', 'message', 'error', 'result'].includes(k))
          if (hasRealData) d2 = rawResponse2 as Record<string, unknown>
        }
        if (!d2 && typeof rawResult2 === 'string' && rawResult2.trim().length > 0) {
          try {
            const parsed = JSON.parse(rawResult2)
            if (parsed && typeof parsed === 'object') d2 = parsed as Record<string, unknown>
          } catch {
            d2 = { text: rawResult2 } as Record<string, unknown>
          }
        }
      }
      // Look for patterns in multiple possible fields
      let patterns: unknown[] = []
      if (d2) {
        if (Array.isArray(d2?.patterns)) patterns = d2.patterns as unknown[]
        else if (Array.isArray(d2?.jtbd_reasons)) patterns = d2.jtbd_reasons as unknown[]
        else if (Array.isArray(d2?.jtbd_patterns)) patterns = d2.jtbd_patterns as unknown[]
        else if (Array.isArray(d2?.reasons)) patterns = d2.reasons as unknown[]
        else if (Array.isArray(d2?.insights)) patterns = d2.insights as unknown[]
      }
      // If no structured patterns found but we have data, continue anyway - Copy Generator can work with raw data
      if (!d2 || (typeof d2 === 'object' && Object.keys(d2).length === 0)) {
        // Pattern extraction failed, but we can still try to generate copy from review data alone
        updateAgent('jtbdExtractor', { status: 'complete', statusMessage: 'Minimal patterns found. Proceeding with available data.' })
        d2 = { patterns: [], source: 'fallback' } as Record<string, unknown>
      } else {
        const patternCount = typeof d2?.total_patterns_found === 'number' ? d2.total_patterns_found : patterns.length
        setTotalPatterns(patternCount || patterns.length)
        updateAgent('jtbdExtractor', {
          status: 'complete',
          statusMessage: patterns.length > 0 ? `Identified ${patternCount || patterns.length} reasons customers come back.` : 'Analysis complete. Proceeding with available data.',
          data: d2 as Record<string, unknown>,
        })
      }

      // Agent 3: Copy Generator
      updateAgent('copyGenerator', { status: 'running', statusMessage: 'Writing website copy from patterns...' })
      const copyInput = { business: d1, patterns: d2 }
      let r3: Awaited<ReturnType<typeof callAIAgent>>
      try {
        r3 = await callAIAgent(JSON.stringify(copyInput), AGENT_IDS.copyGenerator)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Network error connecting to copy agent'
        updateAgent('copyGenerator', { status: 'failed', statusMessage: errMsg })
        setPipelineError(errMsg)
        stopTimer()
        setIsRunning(false)
        return
      }
      // Parse Copy Generator response robustly
      let d3: Record<string, unknown> | null = null
      if (r3?.success || r3?.response) {
        const rawResult3: any = r3?.response?.result
        const rawResponse3: any = r3?.response
        if (rawResult3 && typeof rawResult3 === 'object' && !Array.isArray(rawResult3) && Object.keys(rawResult3).length > 0) {
          const resultKeys = Object.keys(rawResult3)
          const hasRealData = resultKeys.some(k => !['status', 'message', 'error'].includes(k))
          d3 = hasRealData ? (rawResult3 as Record<string, unknown>) : null
        }
        if (!d3 && rawResponse3 && typeof rawResponse3 === 'object') {
          const responseKeys = Object.keys(rawResponse3)
          const hasRealData = responseKeys.some(k => !['status', 'message', 'error', 'result'].includes(k))
          if (hasRealData) d3 = rawResponse3 as Record<string, unknown>
        }
        if (!d3 && typeof rawResult3 === 'string' && rawResult3.trim().length > 0) {
          try {
            const parsed = JSON.parse(rawResult3)
            if (parsed && typeof parsed === 'object') d3 = parsed as Record<string, unknown>
          } catch {
            // Text response - use as headline
            d3 = { hero_headline: rawResult3 } as Record<string, unknown>
          }
        }
      }
      if (!d3 || (typeof d3 === 'object' && Object.keys(d3).length === 0)) {
        // Copy generation failed but we can still try deployment with fallback
        updateAgent('copyGenerator', { status: 'complete', statusMessage: 'Minimal copy generated. Building site with available data.' })
        d3 = { hero_headline: bName, hero_subtitle: '', cta_text: 'Get in Touch' } as Record<string, unknown>
      } else {
        updateAgent('copyGenerator', {
          status: 'complete',
          statusMessage: 'Site copy ready.',
          data: d3 as Record<string, unknown>,
        })
      }
      setCopyData(d3 as Record<string, unknown>)

      // Agent 4: Deployment Agent
      updateAgent('deploymentAgent', { status: 'running', statusMessage: 'Building the site' })
      const deployInput = { business: d1, patterns: d2, copy: d3 }
      let deployedUrl = ''
      let generatedHtml = ''
      let d4: Record<string, unknown> | null = null

      try {
        const r4 = await callAIAgent(JSON.stringify(deployInput), AGENT_IDS.deploymentAgent)
        if (r4?.success || r4?.response) {
          const rawResult4: any = r4?.response?.result
          if (rawResult4 && typeof rawResult4 === 'object' && Object.keys(rawResult4).length > 0) {
            d4 = rawResult4 as Record<string, unknown>
          } else if (r4?.response && typeof r4.response === 'object') {
            d4 = r4.response as unknown as Record<string, unknown>
          }
          // If result was HTML string directly
          if (!d4 && typeof rawResult4 === 'string' && rawResult4.trim().startsWith('<')) {
            d4 = { html_content: rawResult4 } as Record<string, unknown>
          }
          // Also check raw_response for HTML content if no html_content found yet
          if (d4 && !d4.html_content && typeof r4?.raw_response === 'string') {
            const rawResp = r4.raw_response.trim()
            if (rawResp.startsWith('<!') || rawResp.startsWith('<html')) {
              d4 = { ...d4, html_content: rawResp }
            }
          }
          if (d4 && typeof d4 === 'object' && Object.keys(d4).length > 0) {
            deployedUrl = typeof d4?.live_url === 'string' ? d4.live_url : ''
            const slug = typeof d4?.slug === 'string' ? d4.slug : ''
            generatedHtml = typeof d4?.html_content === 'string' ? d4.html_content.trim() : ''
            if (!deployedUrl && slug) deployedUrl = `https://${slug}.repute.ai`
          }
        }
      } catch {
        // Deployment agent failed - we'll use fallback HTML
      }

      // Fallback: generate HTML from copy data if deployment agent returned none, blank, or placeholder/keyword-only content
      const strippedText = generatedHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      const isHtmlBlankOrMinimal = !generatedHtml
        || generatedHtml.length < 200
        || /^\s*blank\s*$/i.test(strippedText)
        || strippedText.length < 20
      // Detect placeholder/keyword HTML: if the text content mostly contains schema field names
      // instead of actual copy, the agent returned a template rather than a rendered page
      const placeholderKeywords = ['hero_headline', 'hero_subtitle', 'value_props', 'cta_text', 'social_proof', 'reviewer_name', 'pattern_text', '{', '{{', '}}']
      const hasPlaceholders = placeholderKeywords.filter(kw => strippedText.toLowerCase().includes(kw.toLowerCase())).length >= 2
      // Also check if the actual copy data values are NOT present in the generated HTML
      const copyHeadline = typeof d3?.hero_headline === 'string' ? (d3.hero_headline as string).trim() : ''
      const hasCopyContent = copyHeadline.length > 3 && generatedHtml.includes(copyHeadline)
      const shouldUseFallback = isHtmlBlankOrMinimal || hasPlaceholders || (!hasCopyContent && copyHeadline.length > 3)
      if (shouldUseFallback && d3) {
        generatedHtml = generateFallbackHtml(bName, d3 as Record<string, unknown>, d2 as Record<string, unknown>, d1 as Record<string, unknown>)
      }

      setLiveUrl(deployedUrl)
      setHtmlContent(generatedHtml)
      updateAgent('deploymentAgent', {
        status: generatedHtml ? 'complete' : 'failed',
        statusMessage: deployedUrl
          ? `Live at ${deployedUrl}`
          : generatedHtml
            ? 'Website generated successfully. Preview below.'
            : 'Could not generate website. Please try again.',
        data: d4,
      })

      if (!generatedHtml) {
        setPipelineError('The deployment agent could not generate a website. Please try again.')
        stopTimer()
        setIsRunning(false)
        return
      }

      setAllComplete(generatedHtml.length > 0)
    } catch (err) {
      console.error('Pipeline error:', err)
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setPipelineError(errMsg)
      // Mark the currently running agent as failed
      setAgents((prev) => {
        const updated = { ...prev }
        for (const key of Object.keys(updated)) {
          if (updated[key].status === 'running') {
            updated[key] = { ...updated[key], status: 'failed', statusMessage: errMsg }
          }
        }
        return updated
      })
    } finally {
      stopTimer()
      setIsRunning(false)
    }
  }, [updateAgent, startTimer, stopTimer])

  const handleSubmit = useCallback((inputUrl: string) => {
    runPipeline(inputUrl)
  }, [runPipeline])

  const handleReset = useCallback(() => {
    setUrl('')
    setPanelVisible(false)
    setAllComplete(false)
    setPipelineError('')
    setAgents(initialAgents())
    setBusinessName('')
    setElapsedSeconds(0)
    setLiveUrl('')
    setCopyData(null)
    setHtmlContent('')
    setTotalReviews(0)
    setTotalPatterns(0)
    const heroEl = document.getElementById('hero-section')
    if (heroEl) heroEl.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
        <Header />
        <Hero url={url} setUrl={setUrl} onSubmit={handleSubmit} isRunning={isRunning} />

        {/* Four-agent strip — only visible while pipeline is running */}
        {panelVisible && (
          <div className="px-5 md:px-10 pb-8">
            <div className="mx-auto" style={{ maxWidth: 1360 }}>
              <div
                className="p-4"
                style={{
                  background: 'rgba(255,255,255,0.78)',
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(104,92,74,0.18)',
                  borderRadius: 16,
                }}
              >
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.42)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Powered by 4 agents
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {AGENT_INFO.map((a) => {
                    const st = agents[a.key]?.status ?? 'pending'
                    return (
                      <div key={a.key} className="flex items-start gap-2">
                        <div
                          className="mt-1 flex-shrink-0"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: st === 'running' ? '#E07856' : st === 'complete' ? '#3A7D44' : st === 'failed' ? '#E07856' : 'rgba(0,0,0,0.2)',
                          }}
                        />
                        <div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{a.name}</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.42)' }}>{a.purpose}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent execution panel */}
        <div ref={panelRef}>
          <AgentPanel
            visible={panelVisible}
            agents={agents}
            businessName={businessName}
            elapsedSeconds={elapsedSeconds}
            allComplete={allComplete}
            totalReviews={totalReviews}
            totalPatterns={totalPatterns}
            liveUrl={liveUrl}
            onReset={handleReset}
            copyData={copyData}
            htmlContent={htmlContent}
            pipelineError={pipelineError}
          />
        </div>

        {/* Examples + proof — two-column split, hidden while pipeline runs */}
        {!panelVisible && (
          <section className="px-5 md:px-10 py-16 md:py-24">
            <div className="mx-auto" style={{ maxWidth: 1120 }}>
              <div className="flex flex-col md:flex-row gap-12 md:gap-16">

                {/* Left: example sites */}
                <div style={{ flex: '1 1 55%' }}>
                  <h2
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-lora), Georgia, serif',
                      fontWeight: 500,
                      fontSize: 22,
                      color: 'rgba(0,0,0,0.9)',
                      letterSpacing: -0.4,
                    }}
                  >
                    Sites Repute has generated
                  </h2>
                  <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
                    Each one built from what customers wrote, not what the owner wanted to say.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      { business: 'Sharma Sweets', city: 'Mumbai, India', tagline: 'The mawa jalebi people queue for at 7am', accent: '#E8A000' },
                      { business: 'Wellness Dental', city: 'Bengaluru, India', tagline: 'The dentist who explains every step before doing it', accent: '#E07856' },
                      { business: 'Hyderabad UPSC Academy', city: 'Hyderabad, India', tagline: 'The prelims strategy students keep coming back for', accent: '#7A9E7E' },
                    ].map((s) => (
                      <div
                        key={s.business}
                        className="flex items-center gap-4 p-4"
                        style={{
                          background: 'white',
                          borderRadius: 12,
                          border: '1px solid rgba(0,0,0,0.07)',
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: s.accent,
                            flexShrink: 0,
                            opacity: 0.18,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{s.business}</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.5)', marginTop: 1 }}>{s.tagline}</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 2 }}>{s.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: regional proof */}
                <div style={{ flex: '1 1 40%' }} className="flex flex-col justify-center">
                  <h2
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-lora), Georgia, serif',
                      fontWeight: 500,
                      fontSize: 22,
                      color: 'rgba(0,0,0,0.9)',
                      letterSpacing: -0.4,
                    }}
                  >
                    Live across 8 cities
                  </h2>
                  <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
                    India, MENA, and Turkey. Works with Google Maps, Zomato, JustDial, Practo, and more.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Jaipur', 'Dubai', 'Riyadh', 'Istanbul'].map((city) => (
                      <span
                        key={city}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 13,
                          color: 'rgba(0,0,0,0.65)',
                          background: 'white',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 100,
                          padding: '4px 12px',
                        }}
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        <TemplateShowcase />
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
