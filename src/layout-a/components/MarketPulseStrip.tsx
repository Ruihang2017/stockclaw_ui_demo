import { useState, useEffect } from 'react'
import type { MarketPulseItem, MarketPulseImpact } from '../types'

const IMPACT_LABELS: Record<MarketPulseImpact, string> = {
  futures: 'Futures',
  rates: 'Rates',
  sector: 'Sector',
  macro: 'Macro',
}

const ROTATION_MS = 3000

interface MarketPulseStripProps {
  items: MarketPulseItem[]
}

export function MarketPulseStrip({ items }: MarketPulseStripProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (items.length === 0) return
    const id = setInterval(
      () => setCurrentIndex((i) => (i + 1) % items.length),
      ROTATION_MS
    )
    return () => clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null

  const item = items[currentIndex % items.length]

  return (
    <div className="border-b border-charcoal-700 bg-charcoal-800 px-4 py-1.5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <h3 className="shrink-0 text-xs font-medium uppercase tracking-wide text-accent-gold">
          What&apos;s moving the market
        </h3>
        <div
          className="min-w-0 flex-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs font-medium text-gray-200">{item.headline}</span>
            {item.impact && (
              <span className="rounded border border-charcoal-600 bg-charcoal-700 px-1.5 py-0.5 text-[10px] text-gray-500">
                {IMPACT_LABELS[item.impact]}
              </span>
            )}
            <span className="text-[10px] text-gray-500">{item.time}</span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs leading-tight text-gray-500">
            {item.oneLiner}
          </p>
        </div>
        {items.length > 1 && (
          <div className="flex shrink-0 gap-1" aria-hidden="true">
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full ${
                  i === currentIndex ? 'bg-accent-gold' : 'bg-charcoal-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
