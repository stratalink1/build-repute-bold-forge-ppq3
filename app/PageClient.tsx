'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import Header from './sections/Header'
import Hero from './sections/Hero'
import AgentPanel from './sections/AgentPanel'
import type { AgentState, AgentStatus } from './sections/AgentPanel'
import ShowcaseGrid from './sections/ShowcaseGrid'
import RegionalMap from './sections/RegionalMap'
import Footer from './sections/Footer'

/**
 * Extract business name from supported listing URLs.
 * Returns the decoded name or null if not parseable.
 */
function extractBusinessNameFromUrl(url: string): string | null {
  try {
    // Google Maps: /maps/place/Lazy+Susie+Cafe/@... or /maps/place/Lazy%20Susie%20Cafe/
    const gmapsMatch = url.match(/\/maps\/place\/([^/@]+)/)
    if (gmapsMatch) {
      return decodeURIComponent(gmapsMatch[1].replace(/\+/g, ' ')).trim()
    }
    // Zomato: /city/restaurant-name/...
    const zomatoMatch = url.match(/zomato\.com\/[^/]+\/([^/]+)/)
    if (zomatoMatch) {
      return zomatoMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()
    }
    // JustDial: /city/business-name-...
    const jdMatch = url.match(/justdial\.com\/[^/]+\/([^/]+)/)
    if (jdMatch) {
      const raw = jdMatch[1].split('-').slice(0, -1).join(' ')
      return raw.replace(/\b\w/g, c => c.toUpperCase()).trim() || null
    }
    // Practo: /doctor/... or /clinic/...
    const practoMatch = url.match(/practo\.com\/[^/]+\/(doctor|clinic)\/([^/]+)/)
    if (practoMatch) {
      return practoMatch[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()
    }
  } catch {
    // URL parsing failed — fall through
  }
  return null
}

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
  { name: 'JTBD Extractor', purpose: 'Finds patterns in customer language', key: 'jtbdExtractor' },
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
  const ctaText = typeof copyData?.cta_text === 'string' && copyData.cta_text.trim() ? copyData.cta_text : 'Get Directions'
  const metaDesc = typeof copyData?.meta_description === 'string' ? copyData.meta_description : subtitle
  const valueProps = Array.isArray(copyData?.value_props) ? (copyData.value_props as Array<Record<string, unknown>>) : (Array.isArray(copyData?.value_propositions) ? (copyData.value_propositions as Array<Record<string, unknown>>) : [])
  const socialProof = Array.isArray(copyData?.social_proof) ? (copyData.social_proof as Array<Record<string, unknown>>) : (Array.isArray(copyData?.testimonials) ? (copyData.testimonials as Array<Record<string, unknown>>) : [])
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
  const phoneNumber = typeof reviewData?.phone_number === 'string' ? reviewData.phone_number : ''
  const category = typeof reviewData?.category === 'string' ? reviewData.category : ''
  const city = typeof reviewData?.city === 'string' ? reviewData.city : ''
  const businessHours = Array.isArray(reviewData?.business_hours) ? (reviewData.business_hours as Array<Record<string, unknown>>) : []
  const popularItems = Array.isArray(reviewData?.popular_items) ? (reviewData.popular_items as Array<Record<string, unknown>>) : []
  const photoUrls = Array.isArray(reviewData?.photo_urls) ? (reviewData.photo_urls as string[]) : []

  const starSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E8A838" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  const halfStarSvg = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hs"><stop offset="50%" stop-color="#E8A838"/><stop offset="50%" stop-color="#ddd"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#hs)"/></svg>`
  const emptyStarSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#ddd" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`

  const starsHtml = (() => {
    if (avgRating <= 0) return ''
    const full = Math.floor(avgRating)
    const hasHalf = avgRating - full >= 0.3
    const empty = 5 - full - (hasHalf ? 1 : 0)
    return Array(full).fill(starSvg).join('') + (hasHalf ? halfStarSvg : '') + Array(Math.max(0, empty)).fill(emptyStarSvg).join('')
  })()

  // Navigation section IDs
  const navSections = [
    valueProps.length > 0 ? { id: 'why-choose-us', label: 'Why Choose Us' } : null,
    photoUrls.length > 0 ? { id: 'photos', label: 'Photos' } : null,
    popularItems.length > 0 ? { id: 'popular-items', label: 'Popular Items' } : null,
    socialProof.length > 0 ? { id: 'testimonials', label: 'What People Say' } : null,
    businessHours.length > 0 ? { id: 'hours', label: 'Hours' } : null,
  ].filter(Boolean) as Array<{ id: string; label: string }>

  const navLinksHtml = navSections.map(s => `<a href="#${s.id}" style="font-size:16px;color:#1a1a1a;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#c41e3a'" onmouseout="this.style.color='#1a1a1a'">${escapeHtml(s.label)}</a>`).join('')

  // Customer tips from copy generator
  const customerTips = Array.isArray(copyData?.customer_tips) ? (copyData.customer_tips as Array<Record<string, unknown>>) : []

  // Value props cards with blockquotes from supporting reviews
  const vpHtml = valueProps.map((vp) => {
    const title = typeof vp?.title === 'string' ? escapeHtml(vp.title) : (typeof vp?.heading === 'string' ? escapeHtml(vp.heading) : (typeof vp?.name === 'string' ? escapeHtml(vp.name) : ''))
    const body = typeof vp?.body === 'string' ? escapeHtml(vp.body) : (typeof vp?.description === 'string' ? escapeHtml(vp.description) : (typeof vp?.text === 'string' ? escapeHtml(vp.text) : ''))
    const blockquote = typeof vp?.blockquote === 'string' ? escapeHtml(vp.blockquote) : ''
    const citation = typeof vp?.citation === 'string' ? escapeHtml(vp.citation) : ''
    if (!title && !body) return ''
    return `
    <div style="flex:1;min-width:300px;background:#fff;border-radius:8px;padding:32px;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      <h3 style="font-size:24px;font-weight:600;margin:0 0 16px;color:#1a1a1a;line-height:1.3;letter-spacing:-0.48px;">${title}</h3>
      <p style="font-size:18px;line-height:1.6;color:#666;margin:0 0 ${blockquote ? '16px' : '0'};">${body}</p>
      ${blockquote ? `<blockquote style="margin:0;padding:12px 0 12px 16px;border-left:3px solid #e5e5e5;font-size:16px;line-height:1.6;color:#888;font-style:italic;">&ldquo;${blockquote}&rdquo;${citation ? `<cite style="display:block;margin-top:8px;font-size:14px;color:#999;font-style:normal;">&mdash; ${citation}</cite>` : ''}</blockquote>` : ''}
    </div>`
  }).filter(Boolean).join('')

  // Photo gallery
  const photosHtml = photoUrls.slice(0, 10).map((url, i) => `
    <div style="position:relative;border-radius:16px;overflow:hidden;height:220px;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
      <img src="${escapeHtml(String(url))}" alt="Photo ${i + 1}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.parentElement.style.display='none'"/>
    </div>`).join('')

  // Popular items
  const popularItemsHtml = popularItems.slice(0, 8).map((item) => {
    const name = typeof item?.name === 'string' ? escapeHtml(item.name) : ''
    const mentions = typeof item?.mentions === 'number' ? item.mentions : 0
    if (!name) return ''
    // Find a matching review quote for this item
    const reviews = Array.isArray(reviewData?.reviews) ? (reviewData.reviews as Array<Record<string, unknown>>) : []
    const matchingReview = reviews.find(r => typeof r?.text === 'string' && (r.text as string).toLowerCase().includes(name.toLowerCase()))
    const reviewQuote = matchingReview && typeof matchingReview.text === 'string' ? escapeHtml(matchingReview.text.slice(0, 120)) : ''
    const reviewerName = matchingReview && typeof matchingReview.reviewer_name === 'string' ? escapeHtml(matchingReview.reviewer_name) : ''
    return `
    <div style="background:#fff;border-radius:8px;padding:24px;">
      <h3 style="font-size:24px;font-weight:600;margin:0 0 12px;color:#1a1a1a;">${name}</h3>
      ${mentions > 0 ? `<p style="font-size:14px;color:#888;margin:0 0 8px;">Mentioned ${mentions} times in reviews</p>` : ''}
      ${reviewQuote ? `<p style="font-size:16px;line-height:1.6;color:#666;margin:0 0 8px;font-style:italic;">&ldquo;${reviewQuote}&rdquo;</p>` : ''}
      ${reviewerName ? `<p style="font-size:14px;color:#999;margin:0;">&mdash; ${reviewerName}</p>` : ''}
    </div>`
  }).filter(Boolean).join('')

  // Testimonials
  const quotesHtml = socialProof.slice(0, 8).map((sp) => {
    const quote = typeof sp?.quote === 'string' ? escapeHtml(sp.quote) : (typeof sp?.text === 'string' ? escapeHtml(sp.text) : (typeof sp?.testimonial === 'string' ? escapeHtml(sp.testimonial) : (typeof sp?.review_text === 'string' ? escapeHtml(sp.review_text) : '')))
    const name = typeof sp?.reviewer_name === 'string' ? escapeHtml(sp.reviewer_name) : (typeof sp?.name === 'string' ? escapeHtml(sp.name) : (typeof sp?.author === 'string' ? escapeHtml(sp.author) : 'Customer'))
    if (!quote) return ''
    return `
    <div style="background:#fff;border-radius:8px;padding:24px;flex:1;min-width:280px;">
      <p style="font-size:18px;line-height:1.6;color:#333;margin:0 0 16px;">&ldquo;${quote}&rdquo;</p>
      <p style="font-size:14px;color:#888;margin:0;font-weight:600;">&mdash; ${name}</p>
    </div>`
  }).filter(Boolean).join('')

  // Tips: prefer customer_tips from copy generator, then fall back to patterns
  const tipsSource = customerTips.length > 0 ? customerTips : patterns
  const tipsHtml = tipsSource.slice(0, 6).map((p) => {
    const text = typeof p?.title === 'string' ? escapeHtml(p.title)
      : typeof p?.pattern_text === 'string' ? escapeHtml(p.pattern_text)
      : typeof p?.reason === 'string' ? escapeHtml(p.reason)
      : typeof p?.text === 'string' ? escapeHtml(p.text)
      : typeof p?.insight === 'string' ? escapeHtml(p.insight)
      : typeof p?.description === 'string' ? escapeHtml(p.description)
      : typeof p?.name === 'string' ? escapeHtml(p.name) : ''
    const quote = typeof p?.body === 'string' ? escapeHtml(p.body)
      : typeof p?.representative_quote === 'string' ? escapeHtml(p.representative_quote)
      : typeof p?.supporting_quote === 'string' ? escapeHtml(p.supporting_quote)
      : typeof p?.quote === 'string' ? escapeHtml(p.quote)
      : typeof p?.example === 'string' ? escapeHtml(p.example) : ''
    if (!text) return ''
    return `
    <div style="background:#fff;border-radius:8px;padding:24px;">
      <h4 style="font-size:20px;font-weight:600;margin:0 0 8px;color:#1a1a1a;">${text}</h4>
      ${quote ? `<p style="font-size:16px;line-height:1.6;color:#666;margin:0;font-style:italic;">&ldquo;${quote}&rdquo;</p>` : ''}
    </div>`
  }).filter(Boolean).join('')

  // Business hours
  const hoursHtml = businessHours.map((h) => {
    const day = typeof h?.day === 'string' ? escapeHtml(h.day) : ''
    const hours = typeof h?.hours === 'string' ? escapeHtml(h.hours) : ''
    if (!day) return ''
    return `
    <div style="padding:16px 24px;">
      <div style="font-size:20px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">${day}</div>
      <div style="font-size:16px;color:#666;">${hours || 'Hours not available'}</div>
    </div>`
  }).filter(Boolean).join('')

  // Rating badge for hero
  const ratingBadgeHtml = avgRating > 0 ? `
    <div style="display:inline-flex;align-items:center;gap:12px;background:#fff;padding:12px 20px;border-radius:32px;margin-top:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="display:flex;gap:2px;">${starsHtml}</div>
      <span style="font-size:16px;font-weight:700;color:#1a1a1a;">${avgRating.toFixed(1)}</span>
      ${reviewCount > 0 ? `<span style="font-size:14px;color:#666;">${reviewCount} reviews on Google</span>` : ''}
    </div>` : ''

  // Google Maps search URL
  const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(businessName + (city ? ' ' + city : ''))}`

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
html{scroll-behavior:smooth;}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f5f5f5;-webkit-font-smoothing:antialiased;letter-spacing:-0.011em;line-height:1.6;}
a{color:inherit;text-decoration:none;}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:#f6f6f6eb;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:0 40px;height:60px;display:flex;align-items:center;justify-content:space-between;}
.nav-logo{font-size:16px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;}
.nav-links{display:flex;gap:32px;align-items:center;}
.nav-hamburger{display:none;background:none;border:none;cursor:pointer;padding:8px;}
.content-wrapper{max-width:1200px;margin:0 auto;padding:0 32px;}
.hero{padding:120px 0 80px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.hero-text h1{font-size:56px;font-weight:700;line-height:1.08;letter-spacing:-1.12px;margin-bottom:20px;color:#1a1a1a;}
.hero-text .subtitle{font-size:20px;color:#666;line-height:1.6;margin-bottom:32px;}
.hero-ctas{display:flex;gap:12px;flex-wrap:wrap;}
.btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#1a1a1a;color:#fff;border-radius:8px;font-size:16px;font-weight:500;transition:opacity 0.2s;border:none;cursor:pointer;text-decoration:none;}
.btn-primary:hover{opacity:0.88;}
.btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:transparent;color:#1a1a1a;border:1.5px solid #1a1a1a;border-radius:8px;font-size:16px;font-weight:500;transition:all 0.2s;cursor:pointer;text-decoration:none;}
.btn-secondary:hover{background:#1a1a1a;color:#fff;}
.hero-image{position:relative;height:560px;border-radius:16px;overflow:hidden;background:#e8e8e8;}
.hero-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s;}
.hero-image:hover img{transform:scale(1.02);}
.section{padding:80px 0;}
.section-label{font-size:20px;text-transform:uppercase;letter-spacing:0.05em;color:#666;margin-bottom:16px;}
.section-title{font-size:40px;font-weight:700;letter-spacing:-0.8px;margin-bottom:48px;color:#1a1a1a;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;}
.grid-5{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;}
.hours-grid{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border-radius:12px;border:1px solid #e5e5e5;overflow:hidden;}
.hours-grid>div{border-right:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;}
.hours-grid>div:nth-child(4n){border-right:none;}
.open-badge{display:inline-flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:16px;font-size:14px;font-weight:500;margin-left:12px;}
.open-badge::before{content:'';width:8px;height:8px;background:#15803d;border-radius:50%;}
.map-container{border-radius:16px;overflow:hidden;height:500px;background:#e8e8e8;}
.dark-footer{background:#333;color:#fff;padding:48px 0 32px;}
.dark-footer .footer-inner{max-width:1200px;margin:0 auto;padding:0 32px;text-align:center;}
.dark-footer .copyright{border-top:1px solid rgba(255,255,255,0.1);margin-top:32px;padding-top:24px;color:rgba(255,255,255,0.5);font-size:14px;}
.mobile-menu{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;z-index:200;flex-direction:column;align-items:center;justify-content:center;gap:32px;}
.mobile-menu a{font-size:24px;color:#1a1a1a;font-weight:500;}
.mobile-menu-close{position:absolute;top:20px;right:20px;background:none;border:none;font-size:28px;cursor:pointer;}
@media(max-width:1024px){
  .hero{grid-template-columns:1fr;gap:40px;}
  .hero-image{height:400px;}
  .grid-3{grid-template-columns:1fr;}
  .grid-4{grid-template-columns:repeat(2,1fr);}
  .grid-5{grid-template-columns:repeat(3,1fr);}
  .hours-grid{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:768px){
  .nav{padding:0 20px;}
  .nav-links{display:none;}
  .nav-hamburger{display:block;}
  .content-wrapper{padding:0 20px;}
  .hero{padding:80px 0 40px;}
  .hero-text h1{font-size:36px;letter-spacing:-0.72px;}
  .hero-text .subtitle{font-size:16px;}
  .hero-image{height:300px;}
  .section{padding:40px 0;}
  .section-title{font-size:28px;margin-bottom:32px;}
  .grid-3,.grid-4{grid-template-columns:1fr;}
  .grid-5{grid-template-columns:repeat(2,1fr);}
  .hours-grid{grid-template-columns:1fr;}
  .map-container{height:300px;}
  .hero-ctas{flex-direction:column;}
  .hero-ctas a,.hero-ctas button{width:100%;justify-content:center;}
}
</style>
</head>
<body>

<!-- Fixed Navigation -->
<nav class="nav">
  <div class="nav-logo">${escapeHtml(businessName)}</div>
  <div class="nav-links">${navLinksHtml}</div>
  <button class="nav-hamburger" onclick="document.getElementById('mobile-menu').style.display='flex'" aria-label="Menu">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>
</nav>

<!-- Mobile Menu -->
<div id="mobile-menu" class="mobile-menu">
  <button class="mobile-menu-close" onclick="document.getElementById('mobile-menu').style.display='none'" aria-label="Close">&times;</button>
  ${navSections.map(s => `<a href="#${s.id}" onclick="document.getElementById('mobile-menu').style.display='none'">${escapeHtml(s.label)}</a>`).join('')}
</div>

<!-- Hero Section -->
<div class="content-wrapper">
  <div class="hero">
    <div class="hero-text">
      <h1>${escapeHtml(headline)}</h1>
      ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
      <div class="hero-ctas">
        <a href="${mapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Get directions
        </a>
        ${phoneNumber ? `<a href="tel:${escapeHtml(phoneNumber)}" class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          ${escapeHtml(phoneNumber)}
        </a>` : ''}
      </div>
      ${ratingBadgeHtml}
    </div>
    <div class="hero-image">
      ${photoUrls.length > 0 ? `<img src="${escapeHtml(String(photoUrls[0]))}" alt="${escapeHtml(businessName)}" onerror="this.style.display='none'"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e8e8e8,#d4d4d4);"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}
      ${photoUrls.length > 1 ? `<div style="position:absolute;bottom:16px;left:16px;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);padding:8px 16px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        View gallery (${photoUrls.length} photos)
      </div>` : ''}
    </div>
  </div>
</div>

${vpHtml ? `
<!-- Why Choose Us -->
<div id="why-choose-us" class="section" style="background:#f5f5f5;">
  <div class="content-wrapper">
    ${category && city ? `<p class="section-label">${escapeHtml(category)} in ${escapeHtml(city)}</p>` : ''}
    <h2 class="section-title">Why Customers Keep Coming Back</h2>
    <div class="grid-3">${vpHtml}</div>
  </div>
</div>` : ''}

${photosHtml ? `
<!-- Photo Gallery -->
<div id="photos" class="section">
  <div class="content-wrapper">
    <h2 class="section-title">Photos</h2>
    <div class="grid-5">${photosHtml}</div>
  </div>
</div>` : ''}

${popularItemsHtml ? `
<!-- Popular Items -->
<div id="popular-items" class="section" style="background:#f5f5f5;">
  <div class="content-wrapper">
    <h2 class="section-title">Customer Favorites</h2>
    <div class="grid-4">${popularItemsHtml}</div>
  </div>
</div>` : ''}

${quotesHtml ? `
<!-- Testimonials -->
<div id="testimonials" class="section">
  <div class="content-wrapper">
    <h2 class="section-title">What People Say</h2>
    <div class="grid-4" style="display:flex;flex-wrap:wrap;gap:24px;">${quotesHtml}</div>
  </div>
</div>` : ''}

${tipsHtml && tipsSource.length > 0 ? `
<!-- Tips from Reviews -->
<div class="section" style="background:#f5f5f5;">
  <div class="content-wrapper">
    <h2 class="section-title">Tips from Frequent Customers</h2>
    <div class="grid-3">${tipsHtml}</div>
  </div>
</div>` : ''}

${hoursHtml ? `
<!-- Store Hours -->
<div id="hours" class="section">
  <div class="content-wrapper">
    <div style="display:flex;align-items:center;margin-bottom:32px;">
      <h2 style="font-size:40px;font-weight:700;letter-spacing:-0.8px;color:#1a1a1a;margin:0;">Store Hours</h2>
      <span class="open-badge">Open now</span>
    </div>
    <div class="hours-grid">${hoursHtml}</div>
  </div>
</div>` : ''}

<!-- Map Section -->
<div class="section">
  <div class="content-wrapper">
    <div class="map-container">
      <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(businessName + (businessAddress ? ', ' + businessAddress : (city ? ', ' + city : '')))}&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</div>

<!-- Dark Footer -->
<footer class="dark-footer">
  <div class="footer-inner">
    <h3 style="font-size:24px;font-weight:700;margin-bottom:16px;">${escapeHtml(businessName)}</h3>
    ${businessAddress ? `<p style="font-size:16px;color:rgba(255,255,255,0.7);margin-bottom:24px;">${escapeHtml(businessAddress)}</p>` : ''}
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;">
      <a href="${mapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);">Get directions</a>
      ${phoneNumber ? `<a href="tel:${escapeHtml(phoneNumber)}" class="btn-secondary" style="color:#fff;border-color:rgba(255,255,255,0.3);">${escapeHtml(phoneNumber)}</a>` : ''}
    </div>
    <div class="copyright">
      &copy; ${new Date().getFullYear()} ${escapeHtml(businessName)} &mdash; Built with Repute
    </div>
  </div>
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
        const parsedName = extractBusinessNameFromUrl(inputUrl)
        const nameHint = parsedName ? `\n\nThe business name extracted from this URL is: "${parsedName}". You MUST return reviews for this EXACT business and no other.` : ''
        r1 = await callAIAgent(
          `Extract reviews for the EXACT business listed at this URL: ${inputUrl}${nameHint}\n\nIMPORTANT: First identify the business name from the URL, then search for reviews for ONLY that specific business. Do NOT return reviews for any other business.`,
          AGENT_IDS.reviewAggregator
        )
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
      // Detect placeholder/keyword HTML: if the text content contains schema field names
      // (in curly braces, parentheses, or bare) instead of actual copy
      const placeholderKeywords = [
        'hero_headline', 'hero_subtitle', 'hero_subheadline', 'value_props', 'value_propositions',
        'cta_text', 'primary_cta_text', 'social_proof', 'reviewer_name', 'pattern_text',
        'meta_description', 'business_name', 'business_address', 'average_rating',
        'review_count', 'total_review_count', 'jtbd_reasons', 'top_quotes', 'supporting_quote',
        'quote_author', 'representative_quote', 'data_source',
        '{', '{{', '}}',
      ]
      const hasPlaceholders = placeholderKeywords.filter(kw => strippedText.toLowerCase().includes(kw.toLowerCase())).length >= 2
      // Detect keywords wrapped in parentheses like (hero_headline) or (cta_text)
      const parenthesisKeywordPattern = /\([a-z_]+\)/gi
      const parenthesisMatches = strippedText.match(parenthesisKeywordPattern) || []
      const hasParenthesisPlaceholders = parenthesisMatches.length >= 2
      // Detect keywords used as button text or bare text (e.g., "cta_text" as a button label)
      const bareKeywordPattern = /\b(hero_headline|hero_subtitle|cta_text|value_props|social_proof|meta_description|business_name|reviewer_name|pattern_text|primary_cta_text|hero_subheadline|supporting_quote|quote_author|jtbd_reasons|top_quotes)\b/gi
      const bareKeywordMatches = strippedText.match(bareKeywordPattern) || []
      const hasBareKeywords = bareKeywordMatches.length >= 1
      // Also check if the actual copy data values are NOT present in the generated HTML
      const copyHeadline = typeof d3?.hero_headline === 'string' ? (d3.hero_headline as string).trim() : ''
      const hasCopyContent = copyHeadline.length > 3 && generatedHtml.includes(copyHeadline)
      const shouldUseFallback = isHtmlBlankOrMinimal || hasPlaceholders || hasParenthesisPlaceholders || hasBareKeywords || (!hasCopyContent && copyHeadline.length > 3)
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

        {/* Four-agent strip - directly under hero */}
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

        <ShowcaseGrid />
        <RegionalMap />
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
