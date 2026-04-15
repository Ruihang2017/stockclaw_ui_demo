import type { WatchlistTicker } from '../types'

interface TickerChipStripProps {
  tickers: WatchlistTicker[]
  selectedTicker: string | null
  onSelectTicker: (symbol: string | null) => void
}

function changeClass(pct: number | undefined) {
  if (pct == null) return 'text-gray-500'
  if (pct > 0) return 'text-bullish'
  if (pct < 0) return 'text-bearish'
  return 'text-gray-400'
}

export function TickerChipStrip({ tickers, selectedTicker, onSelectTicker }: TickerChipStripProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-charcoal-600 bg-charcoal-900 px-3 py-2 [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelectTicker(null)}
        className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
          selectedTicker === null
            ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
            : 'border-charcoal-600 bg-charcoal-800 text-gray-300 hover:border-charcoal-500'
        }`}
      >
        All
      </button>
      {tickers.map((t) => {
        const active = selectedTicker === t.symbol
        return (
          <button
            key={t.symbol}
            type="button"
            onClick={() => onSelectTicker(active ? null : t.symbol)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
              active
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                : 'border-charcoal-600 bg-charcoal-800 text-gray-300 hover:border-charcoal-500'
            }`}
          >
            <span className="font-medium">{t.symbol}</span>
            {t.dailyChangePercent != null && (
              <span className={`ml-1.5 ${changeClass(t.dailyChangePercent)}`}>
                {t.dailyChangePercent >= 0 ? '+' : ''}{t.dailyChangePercent.toFixed(1)}%
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
