import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import type { MarketIndex } from '../types'

interface MarketContextStripProps {
  indexes: MarketIndex[]
}

function changeColor(changePercent: number) {
  if (changePercent > 0) return 'text-bullish'
  if (changePercent < 0) return 'text-bearish'
  return 'text-gray-400'
}

function formatValue(value: number, decimals: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function MarketContextStrip({ indexes }: MarketContextStripProps) {
  return (
    <div className="flex items-stretch gap-0 border-b border-charcoal-700 bg-charcoal-800">
      {indexes.map((idx) => {
        const data = idx.trend.map((v, i) => ({ value: v, index: i }))
        const isUp = idx.changePercent >= 0
        return (
          <div
            key={idx.symbol}
            className="flex min-w-0 flex-1 items-center gap-2 border-r border-charcoal-600 px-3 py-1.5 transition-colors hover:bg-charcoal-700 last:border-r-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] text-gray-500">{idx.name}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-gray-200">
                  {formatValue(idx.value, 1)}
                </span>
                <span className={`text-[10px] ${changeColor(idx.changePercent)}`}>
                  {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="h-8 w-16 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id={`spark-${idx.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isUp ? '#22c55e' : '#ef4444'}
                    strokeWidth={1}
                    fill={`url(#spark-${idx.symbol})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      })}
    </div>
  )
}
