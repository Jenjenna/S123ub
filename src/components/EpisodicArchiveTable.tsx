/**
 * EpisodicArchiveTable
 *
 * Spec requirements:
 *  - Pinned section (pin: true) with a single outer ScrollTrigger that scrubs
 *    horizontal translation of the inner track (innerRef).
 *  - Per-row secondary ScrollTriggers use `containerAnimation` pointing to the
 *    outer timeline so they fire based on horizontal scroll progress.
 *  - Clip-path circle reveals on each row image are also driven by containerAnimation.
 *  - imagesloaded gate: ScrollTrigger created only after all row thumbnails load.
 *  - ScrollTrigger.refresh() called after the gate resolves.
 *  - end value of outer trigger computed from innerRef.scrollWidth dynamically.
 *
 * Dual-axis coordination:
 *  The outer timeline reference (outerTl) is stored and passed as
 *  `containerAnimation` to every child trigger. This is the key architectural
 *  decision that makes row triggers fire against horizontal progress rather
 *  than vertical page scroll.
 *
 * Failure mode: If outerTl is undefined when child triggers are created,
 * containerAnimation will be undefined and child triggers will fall back to
 * vertical scroll — visually broken. Guard: all triggers created inside the
 * single imagesLoaded callback so ordering is deterministic.
 */
import React, { useEffect, useRef } from 'react'
import imagesLoaded from 'imagesloaded'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Episode {
  id: string
  number: string
  title: string
  guest: string
  year: string
  thumb: string
}

const EPISODES: Episode[] = [
  { id: 'e01', number: '001', title: 'The Opening Frame', guest: 'A. Nakamura', year: '2023', thumb: 'https://picsum.photos/seed/ep1/480/320' },
  { id: 'e02', number: '002', title: 'Depth of Field', guest: 'C. Osei', year: '2023', thumb: 'https://picsum.photos/seed/ep2/480/320' },
  { id: 'e03', number: '003', title: 'Negative Space', guest: 'L. Ferreira', year: '2023', thumb: 'https://picsum.photos/seed/ep3/480/320' },
  { id: 'e04', number: '004', title: 'The Long Cut', guest: 'M. Johansson', year: '2024', thumb: 'https://picsum.photos/seed/ep4/480/320' },
  { id: 'e05', number: '005', title: 'Colour Grading', guest: 'R. Patel', year: '2024', thumb: 'https://picsum.photos/seed/ep5/480/320' },
]

export default function EpisodicArchiveTable() {
  const sectionRef = useRef<HTMLElement>(null)
  const innerRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const inner   = innerRef.current
    if (!section || !inner) return

    let outerTrigger: ScrollTrigger | null = null
    let childTriggers: ScrollTrigger[] = []

    const imgLoad = imagesLoaded(section)
    imgLoad.on('always', () => {
      // --- Outer timeline: pins section, scrubs horizontal translation ---
      const totalScroll = inner.scrollWidth - inner.offsetWidth

      // Create the outer ScrollTrigger with a timeline so child triggers
      // can reference it via containerAnimation.
      const outerTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          // end is computed from the actual scroll width of the inner track.
          end: () => `+=${inner.scrollWidth}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      // Translate the inner track from 0 to -totalScroll.
      outerTl.to(inner, {
        x: () => -(inner.scrollWidth - inner.offsetWidth),
        ease: 'none',
        invalidateOnRefresh: true,
      })

      outerTrigger = outerTl.scrollTrigger!

      // --- Per-row child triggers via containerAnimation ---
      const rows = section.querySelectorAll<HTMLElement>('[data-row]')
      rows.forEach((row, i) => {
        const img = row.querySelector<HTMLImageElement>('[data-row-img]')

        // Vertical offset per row: stagger by row index.
        childTriggers.push(
          ScrollTrigger.create({
            trigger: row,
            containerAnimation: outerTrigger ?? undefined,
            start: 'left 80%',
            end: 'left 20%',
            scrub: true,
            onUpdate: (self) => {
              // Vertical offset: even rows rise, odd rows fall.
              const dir = i % 2 === 0 ? -1 : 1
              gsap.set(row, { y: dir * self.progress * 24 })
            },
          }),
        )

        // Clip-path circle reveal on row image.
        if (img) {
          childTriggers.push(
            ScrollTrigger.create({
              trigger: row,
              containerAnimation: outerTrigger ?? undefined,
              start: 'left 90%',
              end: 'left 30%',
              scrub: true,
              onUpdate: (self) => {
                const pct = Math.round(self.progress * 100)
                img.style.clipPath = `circle(${pct}% at 50% 50%)`
              },
            }),
          )
        }
      })

      ScrollTrigger.refresh()
    })

    return () => {
      outerTrigger?.kill()
      childTriggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      id="archive"
      ref={sectionRef}
      className="relative bg-ink overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* Section label — static, outside the scrolling track */}
      <div className="absolute top-10 left-8 z-10">
        <h2 className="font-display text-5xl font-light text-cream">Archive</h2>
        <span className="font-mono text-xs text-muted mt-1 block">
          — Episodic index
        </span>
      </div>

      {/* Horizontal track */}
      <div
        ref={innerRef}
        className="flex items-center gap-0 h-full"
        style={{ width: 'max-content', paddingLeft: '20vw', paddingRight: '10vw' }}
      >
        {EPISODES.map((ep, i) => (
          <article
            key={ep.id}
            data-row
            className="relative flex flex-col justify-end"
            style={{
              width: '38vw',
              minWidth: '320px',
              maxWidth: '520px',
              marginRight: i < EPISODES.length - 1 ? '6vw' : 0,
            }}
          >
            {/* Thumbnail with clip-path reveal */}
            <div className="overflow-hidden mb-6" style={{ aspectRatio: '3/2' }}>
              <img
                data-row-img
                src={ep.thumb}
                alt={ep.title}
                loading="lazy"
                className="w-full h-full object-cover"
                style={{ clipPath: 'circle(0% at 50% 50%)' }}
              />
            </div>

            {/* Row metadata */}
            <div className="border-t border-cream/10 pt-5 flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-muted block mb-2">
                  {ep.number}
                </span>
                <h3 className="font-display text-2xl font-light text-cream mb-1">
                  {ep.title}
                </h3>
                <p className="font-body text-sm text-muted">
                  {ep.guest}
                </p>
              </div>
              <span className="font-mono text-xs text-muted/50 mt-1">
                {ep.year}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
