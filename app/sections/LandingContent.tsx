'use client'

import React from 'react'
import Navbar from './Navbar'
import Hero from './Hero'
import Features from './Features'
import HowItWorks from './HowItWorks'
import SocialProof from './SocialProof'
import CTASection from './CTASection'
import Footer from './Footer'

interface Props {
  urlInput: string
  setUrlInput: (v: string) => void
  onGenerate: () => void
  loading: boolean
  isAuthenticated: boolean
  onLogin: () => void
  onDashboard: () => void
}

export default function LandingContent({ urlInput, setUrlInput, onGenerate, loading, isAuthenticated, onLogin, onDashboard }: Props) {
  return (
    <div style={{ background: '#FAF7F2' }}>
      <Navbar isAuthenticated={isAuthenticated} onLogin={onLogin} onDashboard={onDashboard} />
      <Hero url={urlInput} setUrl={setUrlInput} onSubmit={onGenerate} isRunning={loading} />
      <Features />
      <HowItWorks />
      <SocialProof />
      <CTASection urlInput={urlInput} setUrlInput={setUrlInput} onGenerate={onGenerate} loading={loading} />
      <Footer />
    </div>
  )
}
