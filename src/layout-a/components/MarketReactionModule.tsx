import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Maximize2, X, TrendingUp, BarChart3, Percent, Newspaper, GitCompare } from 'lucide-react'
import type { StockPriceData } from '../types'

export type ChartTimeframe = '1D' | '5D' | '1M' | '3m' | '6m' | '1yr'

interface MarketReactionModuleProps {
  tickerSymbol: string | null
  data: StockPriceData | null
  timeframe: ChartTimeframe
  onTimeframeChange: (tf: ChartTimeframe) => void
  /** When true, render in compact inline style (no expand button). */
  compact?: boolean
}

const TIMEFRAMES: ChartTimeframe[] = ['1D', '5D', '1M', '3m', '6m', '1yr']

function changeColor(changePercent: number) {
  if (changePercent > 0) return 'text-bullish'
  if (changePercent < 0) return 'text-bearish'
  return 'text-gray-400'
}

function getTrendForTimeframe(data: StockPriceData, tf: ChartTimeframe): number[] {
  switch (tf) {
    case '1D':
      return data.trend1D
    case '5D':
      return data.trend5D
    case '1M':
    case '3m':
    case '6m':
    case '1yr':
      const arr = data.trend1M
      const n = arr.length
      if (tf === '3m') return n >= 4 ? arr.slice(0, Math.ceil(n * 0.25)) : arr
      if (tf === '6m') return n >= 2 ? arr.slice(0, Math.ceil(n * 0.5)) : arr
      return arr
    default:
      return data.trend1D
  }
}

function formatXLabel(tf: ChartTimeframe, index: number, total: number): string {
  if (tf === '1D') {
    const hour = 9 + Math.floor((index / total) * 7)
    return `${hour}:00`
  }
  if (tf === '5D') return `D${index + 1}`
  if (tf === '1M' || tf === '3m' || tf === '6m' || tf === '1yr') {
    const month = index + 1
    return `M${month}`
  }
  return `${index + 1}`
}

interface ChartBlockProps {
  tickerSymbol: string
  data: StockPriceData
  timeframe: ChartTimeframe
  chartType: 'line' | 'area'
  viewPct: boolean
  onChartTypeChange: (t: 'line' | 'area') => void
  onViewPctChange: (v: boolean) => void
  height: number
  showToolbar?: boolean
  onTimeframeChange: (tf: ChartTimeframe) => void
}

function ChartBlock({
  tickerSymbol,
  data,
  timeframe,
  chartType,
  viewPct,
  onChartTypeChange,
  onViewPctChange,
  height,
  showToolbar = true,
  onTimeframeChange,
}: ChartBlockProps) {
  const trend = getTrendForTimeframe(data, timeframe)
  const base = trend[0] ?? data.currentPrice
  const chartData = useMemo(
    () =>
      trend.map((value, i) => ({
        index: i,
        value,
        pct: base ? ((value - base) / base) * 100 : 0,
        label: formatXLabel(timeframe, i, trend.length),
      })),
    [trend, base, timeframe]
  )
  const isUp = data.dailyChangePercent >= 0
  const stroke = isUp ? '#22c55e' : '#ef4444'
  const fill = isUp ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'

  const yDomain = viewPct
    ? ([(dataMin: number, dataMax: number) => [dataMin - 0.5, dataMax + 0.5]] as const)
    : (['dataMin', 'dataMax'] as const)
  const yFormatter = viewPct
    ? (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
    : (v: number) => `$${v.toFixed(2)}`

  return (
    <div className="flex flex-col">
      {showToolbar && (
        <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-charcoal-600/80 pb-2">
          <div className="flex gap-0.5">
            <button
              type="button"
              title="Line chart"
              onClick={() => onChartTypeChange('line')}
              className={`rounded p-1 ${chartType === 'line' ? 'bg-charcoal-600 text-accent-gold' : 'text-gray-500 hover:bg-charcoal-600 hover:text-gray-300'}`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Area chart"
              onClick={() => onChartTypeChange('area')}
              className={`rounded p-1 ${chartType === 'area' ? 'bg-charcoal-600 text-accent-gold' : 'text-gray-500 hover:bg-charcoal-600 hover:text-gray-300'}`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            title="Percentage view"
            onClick={() => onViewPctChange(!viewPct)}
            className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${viewPct ? 'bg-charcoal-600 text-accent-gold' : 'text-gray-500 hover:bg-charcoal-600 hover:text-gray-300'}`}
          >
            <Percent className="h-3 w-3" /> %
          </button>
          <div className="mx-1 h-3 w-px bg-charcoal-600" />
          <button
            type="button"
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
          >
            <Newspaper className="h-3 w-3" /> News
          </button>
          <button
            type="button"
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
          >
            <GitCompare className="h-3 w-3" /> vs Index
          </button>
          <div className="mx-1 h-3 w-px bg-charcoal-600" />
          <span className="text-[10px] text-gray-500">Indicators:</span>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
          >
            Mov Avg
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
          >
            Vol
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
          >
            RSI
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
          >
            BB
          </button>
        </div>
      )}
      <div className="flex gap-1 flex-wrap items-center justify-between mb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-200">{tickerSymbol}</span>
          <span className="text-sm text-gray-300">${data.currentPrice.toFixed(2)}</span>
          <span className={changeColor(data.dailyChangePercent)}>
            {data.dailyChange >= 0 ? '+' : ''}{data.dailyChange.toFixed(2)} (
            {data.dailyChangePercent >= 0 ? '+' : ''}{data.dailyChangePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="flex gap-0.5">
          {TIMEFRAMES.map((tf) => (
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
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={yFormatter}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [viewPct ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : `$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Period ${label}`}
              />
              <Area
                type="monotone"
                dataKey={viewPct ? 'pct' : 'value'}
                stroke={stroke}
                fill={fill}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={yFormatter}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [viewPct ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : `$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Period ${label}`}
              />
              <Line
                type="monotone"
                dataKey={viewPct ? 'pct' : 'value'}
                stroke={stroke}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {(data.volume != null || data.relativeStrengthLabel) && (
        <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-gray-500">
          {data.volume != null && (
            <span>
              Vol {data.volume >= 1e6 ? `${(data.volume / 1e6).toFixed(1)}M` : `${(data.volume / 1e3).toFixed(0)}K`}
            </span>
          )}
          {data.relativeStrengthLabel && <span>{data.relativeStrengthLabel}</span>}
        </div>
      )}
    </div>
  )
}

export function MarketReactionModule({
  tickerSymbol,
  data,
  timeframe,
  onTimeframeChange,
  compact = false,
}: MarketReactionModuleProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  const [viewPct, setViewPct] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

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

  const chartBlock = (
    <ChartBlock
      tickerSymbol={tickerSymbol}
      data={data}
      timeframe={timeframe}
      chartType={chartType}
      viewPct={viewPct}
      onChartTypeChange={setChartType}
      onViewPctChange={setViewPct}
      height={compact ? 140 : 200}
      showToolbar={!compact}
      onTimeframeChange={onTimeframeChange}
    />
  )

  return (
    <>
      <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase text-gray-500">Market reaction</p>
          {!compact && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 rounded border border-charcoal-600 bg-charcoal-700 px-2 py-1 text-[10px] text-gray-300 hover:border-charcoal-500 hover:bg-charcoal-600 hover:text-gray-200"
              title="Expand chart"
            >
              <Maximize2 className="h-3 w-3" /> Expand
            </button>
          )}
        </div>
        <div className="mt-2">
          {chartBlock}
        </div>
      </div>

      {modalOpen && !compact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Chart expanded view"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-charcoal-600 bg-charcoal-800 shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-charcoal-600 px-4 py-2">
              <h2 className="text-sm font-medium text-gray-200">
                {tickerSymbol} chart
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1.5 text-gray-400 hover:bg-charcoal-600 hover:text-gray-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <ChartBlock
                tickerSymbol={tickerSymbol}
                data={data}
                timeframe={timeframe}
                chartType={chartType}
                viewPct={viewPct}
                onChartTypeChange={setChartType}
                onViewPctChange={setViewPct}
                height={400}
                showToolbar
                onTimeframeChange={onTimeframeChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
