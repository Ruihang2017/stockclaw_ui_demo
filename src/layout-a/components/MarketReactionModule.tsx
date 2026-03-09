import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import type { StockPriceData } from '../types'

export type ChartTimeframe = '1D' | '5D' | '1M'

interface MarketReactionModuleProps {
  tickerSymbol: string | null
  data: StockPriceData | null
  timeframe: ChartTimeframe
  onTimeframeChange: (tf: ChartTimeframe) => void
}

function changeColor(changePercent: number) {
  if (changePercent > 0) return 'text-bullish'
  if (changePercent < 0) return 'text-bearish'
  return 'text-gray-400'
}

export function MarketReactionModule({ tickerSymbol, data, timeframe, onTimeframeChange }: MarketReactionModuleProps) {
  if (!tickerSymbol) {
    return (
      <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
        <p className="text-[10px] uppercase text-gray-500">Market reaction</p>
        <p className="mt-1 text-xs text-gray-500">Select a ticker or signal to see price context.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
        <p className="text-[10px] uppercase text-gray-500">Market reaction · {tickerSymbol}</p>
        <p className="mt-1 text-xs text-gray-500">No price data for this ticker.</p>
      </div>
    )
  }

  const trend = timeframe === '1D' ? data.trend1D : timeframe === '5D' ? data.trend5D : data.trend1M
  const chartData = trend.map((v, i) => ({ value: v, index: i }))
  const isUp = data.dailyChangePercent >= 0

  return (
    <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase text-gray-500">Market reaction</p>
        <div className="flex gap-0.5">
          {(['1D', '5D', '1M'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                timeframe === tf
                  ? 'bg-accent-gold/20 text-accent-gold'
                  : 'text-gray-500 hover:bg-charcoal-600 hover:text-gray-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-sm font-medium text-gray-200">{tickerSymbol}</span>
        <span className="text-sm text-gray-300">${data.currentPrice.toFixed(2)}</span>
        <span className={changeColor(data.dailyChangePercent)}>
          {data.dailyChange >= 0 ? '+' : ''}{data.dailyChange.toFixed(2)} ({data.dailyChangePercent >= 0 ? '+' : ''}{data.dailyChangePercent.toFixed(2)}%)
        </span>
      </div>
      <div className="mt-2 h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isUp ? '#22c55e' : '#ef4444'}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {(data.volume != null || data.relativeStrengthLabel) && (
        <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-gray-500">
          {data.volume != null && (
            <span>Vol {data.volume >= 1e6 ? `${(data.volume / 1e6).toFixed(1)}M` : `${(data.volume / 1e3).toFixed(0)}K`}</span>
          )}
          {data.relativeStrengthLabel && <span>{data.relativeStrengthLabel}</span>}
        </div>
      )}
    </div>
  )
}
