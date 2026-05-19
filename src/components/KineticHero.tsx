/**
 * KineticHero
 *
 * Pure React + CSS animation engine. Zero GSAP.
 *
 * Spec requirements:
 *  - Hover state drives translate3d / scale3d via inline styles + CSS transition.
 *  - Text split at Math.floor(title.length / 2) — exact, no rounding deviation.
 *  - Red centre line scales its height on hover (kinetic-seam utility class).
 *  - No GSAP involvement.
 *
 * Architecture:
 *  - `useState` tracks `hovered: boolean`.
 *  - The title is split into two halves at the exact midpoint character index.
 *  - On hover, top half translates UP and bottom half translates DOWN,
 *    revealing the red seam line between them.
 *  - `will-change: transform` is applied only during hover to avoid
 *    unnecessary compositor layers at rest.
 *
 * Failure mode: If `title` has an odd number of characters, Math.floor
 * assigns the extra character to the bottom half — this is intentional per
 * spec ("must be exact to avoid visual misalignment at the seam").
 */
import React, { useState } from 'react'

const TITLE = 'SubTubby'
const MID = Math.floor(TITLE.length / 2)
const TOP_HALF = TITLE.slice(0, MID)    // 'SubT'
const BOT_HALF = TITLE.slice(MID)       // 'ubby'

const TRANSLATE_PX = 28
const TRANSITION = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease'

export default function KineticHero() {
  const [hovered, setHovered] = useState(false)

  const topStyle: React.CSSProperties = {
    transform: hovered ? `translate3d(0, -${TRANSLATE_PX}px, 0) scale3d(1.04, 1.04, 1)` : 'translate3d(0,0,0) scale3d(1,1,1)',
    transition: TRANSITION,
    willChange: hovered ? 'transform' : 'auto',
    display: 'block',
    lineHeight: 1,
  }

  const botStyle: React.CSSProperties = {
    transform: hovered ? `translate3d(0, ${TRANSLATE_PX}px, 0) scale3d(1.04, 1.04, 1)` : 'translate3d(0,0,0) scale3d(1,1,1)',
    transition: TRANSITION,
    willChange: hovered ? 'transform' : 'auto',
    display: 'block',
    lineHeight: 1,
  }

  const seamStyle: React.CSSProperties = {
    height: hovered ? '3px' : '0px',
    opacity: hovered ? 1 : 0,
    transition: 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease',
    width: '100%',
    background: 'var(--color-red)',
    display: 'block',
  }

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen bg-cream overflow-hidden"
    >
      {/* Background grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Kinetic title block */}
      <div
        className="relative select-none cursor-default flex flex-col items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Top half */}
        <span
          style={topStyle}
          className="font-display font-light text-[clamp(5rem,16vw,14rem)] text-ink tracking-tighter"
          aria-hidden="true"
        >
          {TOP_HALF}
        </span>

        {/* Red seam line */}
        <span style={seamStyle} role="presentation" />

        {/* Bottom half */}
        <span
          style={botStyle}
          className="font-display font-light text-[clamp(5rem,16vw,14rem)] text-ink tracking-tighter"
          aria-hidden="true"
        >
          {BOT_HALF}
        </span>

        {/* Screen-reader accessible full title */}
        <span className="sr-only">{TITLE}</span>
      </div>

      {/* Subtitle */}
      <p className="mt-12 font-body text-sm tracking-[0.3em] uppercase text-muted">
        A curated video archive
      </p>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-xs text-muted/60 tracking-widest">scroll</span>
        <span
          className="block w-px bg-muted/40"
          style={{
            height: '48px',
            animation: 'scrollLine 1.8s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes scrollLine {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
      `}</style>
    </section>
  )
}
