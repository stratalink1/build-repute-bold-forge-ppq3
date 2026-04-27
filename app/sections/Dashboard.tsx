'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FiCopy, FiExternalLink, FiRefreshCw, FiArrowLeft, FiPlus } from 'react-icons/fi'
import { copyToClipboard } from '@/lib/clipboard'

interface SiteItem {
  _id?: string
  slug?: string
  business_name?: string
  status?: string
  data_source?: string
  live_url?: string
  google_maps_url?: string
  createdAt?: string
}

interface DashboardProps {
  sites: SiteItem[]
  loading: boolean
  error: string
  urlInput: string
  setUrlInput: (val: string) => void
  onGenerate: () => void
  onViewSite: (slug: string) => void
  onBack: () => void
  generating: boolean
}

export default function Dashboard({ sites, loading, error, urlInput, setUrlInput, onGenerate, onViewSite, onBack, generating }: DashboardProps) {
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null)

  const handleCopy = async (slug: string) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/site/${slug}`
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}><FiArrowLeft className="w-4 h-4" /></Button>
            <span className="font-serif font-bold text-2xl text-primary">Repute</span>
          </div>
          <span className="text-sm text-muted-foreground">Your Sites</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* New site input */}
        <Card className="bg-card shadow-md">
          <CardContent className="p-6">
            <h2 className="font-serif font-semibold text-lg text-foreground mb-3">Generate a new site</h2>
            <div className="flex gap-3">
              <Input placeholder="Paste a Google Maps URL..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="flex-1 h-11" />
              <Button onClick={onGenerate} disabled={generating || !urlInput.trim()} className="bg-primary hover:bg-primary/90 h-11">
                {generating ? <FiRefreshCw className="w-4 h-4 animate-spin mr-1" /> : <FiPlus className="w-4 h-4 mr-1" />}
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}

        {/* Sites list */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((n) => <div key={n} className="h-24 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : Array.isArray(sites) && sites.length > 0 ? (
          <div className="space-y-4">
            {sites.map((site) => {
              const s = site?.slug ?? ''
              return (
                <Card key={site?._id ?? s} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-serif font-semibold text-foreground">{site?.business_name ?? 'Untitled Site'}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={site?.status === 'live' ? 'default' : site?.status === 'generating' ? 'secondary' : 'destructive'} className="text-xs">
                          {site?.status ?? 'unknown'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{site?.data_source === 'live' ? 'Live reviews' : 'Demo data'}</Badge>
                        {site?.createdAt && <span className="text-xs text-muted-foreground">{new Date(site.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(s)}>
                        <FiCopy className="w-4 h-4 mr-1" />{copiedSlug === s ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button size="sm" onClick={() => onViewSite(s)}>
                        <FiExternalLink className="w-4 h-4 mr-1" />View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-card shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-2">No sites yet</p>
              <p className="text-sm text-muted-foreground">Paste your Google Maps link above to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
