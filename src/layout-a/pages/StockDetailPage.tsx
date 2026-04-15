import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MarketReactionModule, type ChartTimeframe } from '../components/MarketReactionModule'
import { CompanySnapshot } from '../components/CompanySnapshot'
import { STOCK_PRICE_BY_SYMBOL, COMPANY_FUNDAMENTALS_BY_SYMBOL, SNAPSHOT_PERFORMANCE_BY_SYMBOL, BROKER_CONSENSUS_BY_SYMBOL } from '../mockData'

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1D')

  const displayTicker = symbol ?? null
  const stockPrice = displayTicker ? STOCK_PRICE_BY_SYMBOL[displayTicker] ?? null : null
  const fundamentals = displayTicker ? COMPANY_FUNDAMENTALS_BY_SYMBOL[displayTicker] ?? null : null
  const performance = displayTicker ? SNAPSHOT_PERFORMANCE_BY_SYMBOL[displayTicker] ?? null : null
  const brokerConsensus = displayTicker ? BROKER_CONSENSUS_BY_SYMBOL[displayTicker] ?? null : null

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex shrink-0 items-center gap-3 border-b border-charcoal-600 bg-charcoal-900 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-xs text-gray-200 hover:border-charcoal-500 hover:text-gray-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <h1 className="text-sm font-medium text-accent-gold">
          Stock details · {displayTicker ?? '—'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {displayTicker ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <section>
              <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">Chart</h2>
              <MarketReactionModule
                tickerSymbol={displayTicker}
                data={stockPrice}
                timeframe={chartTimeframe}
                onTimeframeChange={setChartTimeframe}
              />
            </section>
            <section>
              <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">Snapshot</h2>
              <CompanySnapshot
                tickerSymbol={displayTicker}
                data={fundamentals}
                stockPrice={stockPrice}
                performance={performance}
                brokerConsensus={brokerConsensus}
              />
            </section>
            <p className="text-[10px] text-gray-500">
              More sections (announcements, corporate overview, dividend history, etc.) can be added here.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No symbol specified.</p>
        )}
      </main>
    </div>
  )
}
