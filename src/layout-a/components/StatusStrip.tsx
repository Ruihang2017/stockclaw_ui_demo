import { Radio } from 'lucide-react'

interface StatusStripProps {
  lastUpdated: string
  newSignalsInWatchlist: number
  breakingCount: number
}

export function StatusStrip({
  lastUpdated,
  newSignalsInWatchlist,
  breakingCount,
}: StatusStripProps) {
  return (
    <div className="flex h-7 items-center gap-6 border-b border-charcoal-700 bg-charcoal-800 px-4 text-xs text-gray-400">
      <div className="flex items-center gap-1.5 text-system">
        <Radio className="h-3 w-3" />
        <span>LIVE</span>
      </div>
      <span>Last updated {lastUpdated}</span>
      <span>{newSignalsInWatchlist} new signals in watchlist</span>
      {breakingCount > 0 && (
        <span className="text-breaking">{breakingCount} BREAKING</span>
      )}
      <span className="text-bullish">System healthy</span>
    </div>
  )
}
