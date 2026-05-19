import React from 'react'
import SmoothScrollProvider from './components/SmoothScrollProvider'
import Navigation from './components/Navigation'
import KineticHero from './components/KineticHero'
import CuratedMasonryGrid from './components/CuratedMasonryGrid'
import EpisodicArchiveTable from './components/EpisodicArchiveTable'
import Footer from './components/Footer'

export default function App() {
  return (
    // SmoothScrollProvider must wrap the entire application at the root.
    // It initialises Lenis and bridges it to GSAP ScrollTrigger.
    <SmoothScrollProvider>
      <Navigation />
      <main>
        <KineticHero />
        <CuratedMasonryGrid />
        <EpisodicArchiveTable />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
