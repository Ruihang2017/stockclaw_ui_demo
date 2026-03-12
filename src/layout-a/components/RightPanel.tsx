import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { MarketReactionModule, type ChartTimeframe } from './MarketReactionModule'
import { CompanySnapshot } from './CompanySnapshot'
import { STOCK_PRICE_BY_SYMBOL, COMPANY_FUNDAMENTALS_BY_SYMBOL, SNAPSHOT_PERFORMANCE_BY_SYMBOL, BROKER_CONSENSUS_BY_SYMBOL } from '../mockData'

interface RightPanelProps {
  displayTicker: string | null
}

export function RightPanel({ displayTicker }: RightPanelProps) {
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1D')

  const stockPrice = displayTicker ? STOCK_PRICE_BY_SYMBOL[displayTicker] ?? null : null
  const fundamentals = displayTicker ? COMPANY_FUNDAMENTALS_BY_SYMBOL[displayTicker] ?? null : null
  const performance = displayTicker ? SNAPSHOT_PERFORMANCE_BY_SYMBOL[displayTicker] ?? null : null
  const brokerConsensus = displayTicker ? BROKER_CONSENSUS_BY_SYMBOL[displayTicker] ?? null : null

  if (!displayTicker) {
    return (
      <aside className="flex w-full flex-shrink-0 flex-col border-l border-charcoal-600 bg-charcoal-900 md:w-[420px]">
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-500">
          Select a signal or ticker to view details
        </div>
        <div className="border-t border-charcoal-600 p-3 text-[10px] text-gray-500">
          For informational purposes only. Not investment advice.
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex w-full flex-shrink-0 flex-col overflow-hidden border-l border-charcoal-600 bg-charcoal-900 md:w-[420px]">
      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        <MarketReactionModule
          tickerSymbol={displayTicker}
          data={stockPrice}
          timeframe={chartTimeframe}
          onTimeframeChange={setChartTimeframe}
        />
        <div className="mt-3">
          <CompanySnapshot
          tickerSymbol={displayTicker}
          data={fundamentals}
          stockPrice={stockPrice}
          performance={performance}
          brokerConsensus={brokerConsensus}
        />
        </div>
        <div className="mt-3">
          <Link
            to={`/stock/${displayTicker}`}
            className="inline-flex items-center gap-1.5 rounded border border-charcoal-600 bg-charcoal-800 px-3 py-2 text-xs text-accent-gold hover:border-charcoal-500 hover:bg-charcoal-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View full stock details
          </Link>
        </div>
      </div>
      <div className="border-t border-charcoal-600 p-3 text-[10px] text-gray-500">
        For informational purposes only. Not investment advice.
      </div>
    </aside>
  )
}
