/**
 * Footer
 *
 * Global footer — inverted palette (dark background, cream text) per spec.
 */
import React from 'react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-cream py-20 px-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        {/* Wordmark block */}
        <div>
          <span className="font-display text-4xl font-light tracking-widest uppercase block mb-3">
            SubTubby
          </span>
          <p className="font-body text-sm text-muted max-w-xs leading-relaxed">
            A carefully curated archive of episodic video work. Quality over quantity.
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-3">
          {['Archive', 'Curated', 'About', 'Contact'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="font-body text-sm text-muted hover:text-cream transition-colors duration-200 tracking-wider uppercase"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Legal */}
        <div className="text-right">
          <span className="font-mono text-xs text-muted/50 block">
            © {year} SubTubby
          </span>
          <span className="font-mono text-xs text-muted/30 block mt-1">
            All rights reserved
          </span>
        </div>
      </div>
    </footer>
  )
}
