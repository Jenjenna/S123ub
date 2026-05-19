/**
 * SmoothScrollProvider
 *
 * Responsibilities:
 *  1. Instantiate a single Lenis instance at the app root.
 *  2. Run Lenis inside a GSAP ticker so ScrollTrigger and Lenis share the
 *     same animation frame — this is the canonical Lenis + GSAP bridge.
 *  3. Forward every Lenis scroll event to ScrollTrigger.update() so all
 *     scroll-linked animations stay in sync with smoothed scroll position.
 *  4. Call ScrollTrigger.refresh() on window resize so pin distances and
 *     scroll lengths are recalculated (critical for EpisodicArchiveTable).
 *  5. Expose the Lenis instance via context for any child that needs it.
 *
 * Failure mode: If Lenis is instantiated more than once, two separate smooth-
 * scroll loops will compete and ScrollTrigger triggers will fire at wrong
 * positions. Guard: the useEffect cleanup destroys the instance on unmount.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Context so child components can call lenis.scrollTo() if needed.
const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface Props {
  children: ReactNode
}

export default function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // 1. Create Lenis instance.
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // 2. Add Lenis to the GSAP ticker.
    //    gsap.ticker.add receives the elapsed time in seconds; Lenis.raf
    //    expects milliseconds.
    function onTick(time: number) {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)

    // Disable GSAP's own lag smoothing so Lenis controls the scroll feel.
    gsap.ticker.lagSmoothing(0)

    // 3. Bridge: on every Lenis scroll event, tell ScrollTrigger to update.
    lenis.on('scroll', ScrollTrigger.update)

    // 4. Resize handler — recalculate all scroll distances.
    function onResize() {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      // Cleanup: remove ticker, listeners, destroy Lenis.
      gsap.ticker.remove(onTick)
      lenis.off('scroll', ScrollTrigger.update)
      window.removeEventListener('resize', onResize)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
