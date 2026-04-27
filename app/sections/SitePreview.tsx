'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiCopy, FiExternalLink, FiRefreshCw, FiStar, FiMapPin, FiArrowLeft } from 'react-icons/fi'
import { copyToClipboard } from '@/lib/clipboard'

interface AgentResponse {
  status?: string
  data_source?: string
  error_type?: string
  message?: string
  business_name?: string
  business_address?: string
  average_rating?: number
  review_count?: number
  hero_headline?: string
  hero_subheadline?: string
  jtbd_reasons?: Array<{ title?: string; body?: string; supporting_quote?: string; quote_author?: string }>
  top_quotes?: Array<{ text?: string; author?: string }>
  primary_cta_text?: string
  meta_description?: string
  photos?: string[]
}

interface SitePreviewProps {
  data: AgentResponse | null
  slug: string
  loading: boolean
  loadingStep: string
  error: string
  onRegenerate: () => void
  onBack: () => void
  onDashboard: () => void
}

export default function SitePreview({ data, slug, loading, loadingStep, error, onRegenerate, onBack, onDashboard }: SitePreviewProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/site/${slug}`
    const success = await copyToClipboard(url)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-serif font-semibold text-foreground">{loadingStep}</p>
          <p className="text-sm text-muted-foreground">This usually takes under 60 seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full bg-card shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-destructive text-xl font-bold">!</span>
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">Generation Failed</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onBack}><FiArrowLeft className="mr-2 w-4 h-4" />Back</Button>
              <Button onClick={onRegenerate}><FiRefreshCw className="mr-2 w-4 h-4" />Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const reasons = Array.isArray(data?.jtbd_reasons) ? data.jtbd_reasons : []
  const quotes = Array.isArray(data?.top_quotes) ? data.top_quotes : []
  const photos = Array.isArray(data?.photos) ? data.photos : []

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}><FiArrowLeft className="w-4 h-4" /></Button>
            <span className="font-serif font-bold text-lg text-primary">Repute</span>
            <Badge variant="secondary" className="text-xs">{data?.data_source === 'live' ? 'Live reviews' : 'Demo data'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <FiCopy className="w-4 h-4 mr-1" />{copied ? 'Copied!' : 'Copy link'}
            </Button>
            <Button variant="outline" size="sm" onClick={onRegenerate}><FiRefreshCw className="w-4 h-4 mr-1" />Regenerate</Button>
            <Button size="sm" onClick={onDashboard}>Dashboard</Button>
          </div>
        </div>
      </div>

      {/* Generated site preview */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          {photos.length > 0 && (
            <div className="flex gap-3 justify-center mb-6 overflow-x-auto">
              {photos.slice(0, 3).map((p, i) => (
                <div key={i} className="w-48 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={p} alt={`Business photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              ))}
            </div>
          )}
          <h1 className="font-serif font-semibold text-3xl md:text-4xl text-foreground">{data?.hero_headline ?? data?.business_name ?? 'Your Business'}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{data?.hero_subheadline ?? ''}</p>
          {data?.primary_cta_text && (
            <Button size="lg" className="mt-4 bg-primary hover:bg-primary/90 font-semibold">{data.primary_cta_text}</Button>
          )}
        </section>

        {/* JTBD Reasons */}
        {reasons.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-serif font-semibold text-2xl text-center text-foreground">Why Customers Choose Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {reasons.map((r, i) => (
                <Card key={i} className="bg-card shadow-md border-t-4 border-t-[hsl(var(--accent))]">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-serif font-semibold text-lg text-foreground">{r?.title ?? ''}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r?.body ?? ''}</p>
                    {r?.supporting_quote && (
                      <blockquote className="border-l-2 border-[hsl(var(--accent))] pl-3 mt-3">
                        <p className="text-sm italic text-foreground">&ldquo;{r.supporting_quote}&rdquo;</p>
                        {r?.quote_author && <cite className="text-xs text-muted-foreground mt-1 block">-- {r.quote_author}</cite>}
                      </blockquote>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Top Quotes */}
        {quotes.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-serif font-semibold text-2xl text-center text-foreground">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quotes.map((q, i) => (
                <Card key={i} className="bg-card shadow-md">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map((n) => <FiStar key={n} className="w-4 h-4 text-[hsl(var(--accent))] fill-[hsl(var(--accent))]" />)}
                    </div>
                    <p className="text-sm italic text-foreground leading-relaxed">&ldquo;{q?.text ?? ''}&rdquo;</p>
                    {q?.author && <p className="text-xs text-muted-foreground mt-3">-- {q.author}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Business Info Footer */}
        <section className="border-t border-border pt-8 text-center space-y-2">
          <h3 className="font-serif font-semibold text-xl text-foreground">{data?.business_name ?? ''}</h3>
          {data?.business_address && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><FiMapPin className="w-4 h-4" />{data.business_address}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {(data?.average_rating ?? 0) > 0 && (
              <span className="flex items-center gap-1"><FiStar className="w-4 h-4 text-[hsl(var(--accent))]" />{data?.average_rating} rating</span>
            )}
            {(data?.review_count ?? 0) > 0 && <span>{data?.review_count} reviews</span>}
          </div>
          {data?.meta_description && <p className="text-xs text-muted-foreground max-w-lg mx-auto mt-2">{data.meta_description}</p>}
        </section>
      </div>
    </div>
  )
}
