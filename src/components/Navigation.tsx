/**
 * Navigation
 *
 * Fixed header that transitions to a frosted-glass state when the user
 * scrolls past the bottom of KineticHero.
 *
 * Implementation:
 *  - A single ScrollTrigger watches the #hero sentinel element.
 *  - onEnter / onLeaveBack toggle the `scrolled` CSS class.
 *  - The class swap drives the backdrop-blur and border via Tailwind.
 *
 * Failure mode: If the hero sentinel doesn't exist when Navigation mounts,
 * the trigger will never fire. Guard: trigger start is set to "bottom top"
 * (hero bottom reaching viewport top) so it's position-based, not element-
 * existence-based.
 */
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../lib/utils'

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const trigger = ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom top',
      onEnter: () => nav.classList.add('nav--scrolled'),
      onLeaveBack: () => nav.classList.remove('nav--scrolled'),
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <header
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        'px-8 py-5',
        'transition-all duration-500',
        // Base: transparent
        'bg-transparent border-b border-transparent',
        // Scrolled state applied via JS class toggle
        '[&.nav--scrolled]:bg-cream/80 [&.nav--scrolled]:backdrop-blur-md',
        '[&.nav--scrolled]:border-ink/10',
      )}
    >
      {/* Wordmark */}
      <a
        href="#"
        className="font-display text-2xl font-light tracking-widest uppercase text-ink"
      >
        SubTubby
      </a>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-10">
        {['Archive', 'Curated', 'About'].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="font-body text-sm font-medium tracking-wider uppercase text-ink/70 hover:text-ink transition-colors duration-200"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Mono accent */}
      <span className="font-mono text-xs text-muted hidden md:block">
        Vol. 01
      </span>
    </header>
  )
}
