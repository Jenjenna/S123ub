/**
 * CuratedMasonryGrid
 *
 * Spec requirements:
 *  - Dual-column layout with opposing yPercent parallax on odd/even columns.
 *  - imagesloaded gate: ScrollTrigger instances created only after all images load.
 *  - requestAnimationFrame velocity loop: computes scroll velocity and applies
 *    skewY per column, clamped to ±8°.
 *  - ScrollTrigger.refresh() called after imagesloaded resolves.
 *
 * Architecture:
 *  - Left column (even index): scrolls UP (negative yPercent offset).
 *  - Right column (odd index): scrolls DOWN (positive yPercent offset).
 *  - skewY is applied via gsap.to() with a low duration for snappy feel.
 *  - Velocity is derived from the delta between consecutive scrollY values
 *    in the rAF loop.
 *
 * Failure mode: If imagesloaded is not awaited and ScrollTrigger is created
 * before images have their final heights, the trigger end values will be wrong.
 * The imagesloaded callback is the sole init gate.
 */
import React, { useEffect, useRef } from 'react'
import imagesLoaded from 'imagesloaded'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Placeholder image data — replace src values with real assets.
const IMAGES: { src: string; alt: string; col: 0 | 1 }[] = [
  { src: 'https://picsum.photos/seed/st1/600/800', alt: 'Archive still 1', col: 0 },
  { src: 'https://picsum.photos/seed/st2/600/900', alt: 'Archive still 2', col: 1 },
  { src: 'https://picsum.photos/seed/st3/600/700', alt: 'Archive still 3', col: 0 },
  { src: 'https://picsum.photos/seed/st4/600/950', alt: 'Archive still 4', col: 1 },
  { src: 'https://picsum.photos/seed/st5/600/750', alt: 'Archive still 5', col: 0 },
  { src: 'https://picsum.photos/seed/st6/600/850', alt: 'Archive still 6', col: 1 },
]

const LEFT_IMAGES  = IMAGES.filter((i) => i.col === 0)
const RIGHT_IMAGES = IMAGES.filter((i) => i.col === 1)

export default function CuratedMasonryGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftColRef  = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section   = sectionRef.current
    const leftCol   = leftColRef.current
    const rightCol  = rightColRef.current
    if (!section || !leftCol || !rightCol) return

    let rafId: number
    let lastScrollY = window.scrollY
    let currentSkew = 0
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

    // Velocity-based skew loop — runs independently of GSAP.
    function skewLoop() {
      const currentScrollY = window.scrollY
      const velocity = currentScrollY - lastScrollY
      lastScrollY = currentScrollY

      // Lerp toward target skew; target = velocity * skewFactor, clamped ±8°.
      const target = clamp(velocity * 0.06, -8, 8)
      currentSkew += (target - currentSkew) * 0.1

      gsap.set([leftCol, rightCol], { skewY: currentSkew })

      rafId = requestAnimationFrame(skewLoop)
    }

    let triggers: ScrollTrigger[] = []

    // imagesLoaded gate — ScrollTrigger created only after images resolve.
    const imgLoad = imagesLoaded(section)
    imgLoad.on('always', () => {
      // Left column: moves UP (negative yPercent relative offset).
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
          onUpdate: (self) => {
            gsap.set(leftCol, { yPercent: -12 * self.progress })
          },
        }),
      )

      // Right column: moves DOWN (positive yPercent relative offset).
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
          onUpdate: (self) => {
            gsap.set(rightCol, { yPercent: 12 * self.progress })
          },
        }),
      )

      // Recalculate all scroll distances now that image heights are known.
      ScrollTrigger.refresh()

      // Start velocity skew loop.
      rafId = requestAnimationFrame(skewLoop)
    })

    return () => {
      cancelAnimationFrame(rafId)
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      id="curated"
      ref={sectionRef}
      className="relative bg-cream py-32 px-8 overflow-hidden"
    >
      {/* Section label */}
      <div className="flex items-baseline gap-6 mb-16">
        <h2 className="font-display text-5xl font-light text-ink">Curated</h2>
        <span className="font-mono text-xs text-muted">— Selected frames</span>
      </div>

      {/* Dual-column masonry */}
      <div className="flex gap-6 max-w-5xl mx-auto">
        {/* Left column */}
        <div ref={leftColRef} className="flex flex-col gap-6 flex-1 pt-12">
          {LEFT_IMAGES.map((img) => (
            <figure key={img.src} className="overflow-hidden">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-auto block object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </figure>
          ))}
        </div>

        {/* Right column */}
        <div ref={rightColRef} className="flex flex-col gap-6 flex-1 pb-12">
          {RIGHT_IMAGES.map((img) => (
            <figure key={img.src} className="overflow-hidden">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-auto block object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
