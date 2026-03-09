import { ChevronDown, Settings } from 'lucide-react'
import type { WatchlistTicker, WatchlistSummary } from '../types'
import type { FilterChipId } from '../types'

interface LeftPanelProps {
  summary: WatchlistSummary
  tickers: WatchlistTicker[]
  selectedTicker: string | null
  onSelectTicker: (symbol: string) => void
  activeFilter: FilterChipId
  onFilterChange: (id: FilterChipId) => void
}

const FILTER_CHIPS: { id: FilterChipId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'breaking', label: 'Breaking' },
  { id: 'bullish', label: 'Bullish' },
  { id: 'bearish', label: 'Bearish' },
  { id: 'macro', label: 'Macro' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'policy', label: 'Policy' },
]

function SentimentDot({ bias }: { bias: string }) {
  const color =
    bias === 'bullish'
      ? 'bg-bullish'
      : bias === 'bearish'
        ? 'bg-bearish'
        : 'bg-neutral'
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`} title={bias} />
}

function dailyChangeColor(pct: number | undefined) {
  if (pct == null) return 'text-gray-500'
  if (pct > 0) return 'text-bullish'
  if (pct < 0) return 'text-bearish'
  return 'text-gray-400'
}

export function LeftPanel({
  summary,
  tickers,
  selectedTicker,
  onSelectTicker,
  activeFilter,
  onFilterChange,
}: LeftPanelProps) {
  return (
    <aside className="flex w-full flex-shrink-0 flex-col border-r border-charcoal-600 bg-charcoal-900 md:min-w-[280px] md:max-w-[300px]">
      {/* Watchlist selector */}
      <div className="border-b border-charcoal-600 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-200">{summary.name}</span>
          <button type="button" className="shrink-0 text-gray-500 hover:text-gray-300" title="Manage watchlist">
            <Settings className="h-3.5 w-3.5" />
          </button>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{summary.trackedCount} tracked</p>
      </div>

      {/* Summary blocks */}
      <div className="grid grid-cols-2 gap-2 border-b border-charcoal-600 p-3">
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Tracked</p>
          <p className="text-sm font-medium text-gray-200">{summary.trackedCount}</p>
        </div>
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Signals today</p>
          <p className="text-sm font-medium text-gray-200">{summary.signalsToday}</p>
        </div>
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Breaking</p>
          <p className="text-sm font-medium text-breaking">{summary.breakingCount}</p>
        </div>
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Bullish ratio</p>
          <p className="text-sm font-medium text-bullish">{(summary.bullishRatio * 100).toFixed(0)}%</p>
        </div>
        <div className="col-span-2 rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Most active agent</p>
          <p className="text-sm font-medium text-gray-200">{summary.mostActiveAgent}</p>
        </div>
      </div>

      {/* Ticker list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {tickers.map((t) => (
            <button
              key={t.symbol}
              type="button"
              onClick={() => onSelectTicker(t.symbol)}
              className={`flex w-full flex-col gap-0.5 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-charcoal-700 ${
                selectedTicker === t.symbol ? 'bg-charcoal-700 ring-1 ring-accent-gold/50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <SentimentDot bias={t.sentimentBias} />
                {t.hasBreaking && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-breaking" title="Breaking" />
                )}
                <span className="w-12 shrink-0 font-medium text-gray-200">{t.symbol}</span>
                <span className="min-w-0 flex-1 truncate text-gray-500">{t.companyName}</span>
              </div>
              <div className="flex items-center gap-2 pl-3.5">
                {t.currentPrice != null && (
                  <span className="text-gray-300">{t.currentPrice.toFixed(2)}</span>
                )}
                {t.dailyChangePercent != null && (
                  <span className={dailyChangeColor(t.dailyChangePercent)}>
                    {t.dailyChangePercent >= 0 ? '+' : ''}{t.dailyChangePercent.toFixed(1)}%
                  </span>
                )}
                <span className="text-gray-500">{t.signalCountToday} signals</span>
                <span className="text-gray-500">{t.lastSignalAt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-charcoal-600 p-3">
        {FILTER_CHIPS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={`rounded border px-2 py-1 text-[10px] transition-colors ${
              activeFilter === id
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  )
}
