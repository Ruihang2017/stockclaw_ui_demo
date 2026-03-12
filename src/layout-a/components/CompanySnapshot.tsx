import type { CompanyFundamentals, StockPriceData, SnapshotPerformance, BrokerConsensus } from '../types'

interface CompanySnapshotProps {
  tickerSymbol: string | null
  data: CompanyFundamentals | null
  stockPrice?: StockPriceData | null
  performance?: SnapshotPerformance | null
  brokerConsensus?: BrokerConsensus | null
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between gap-2 text-[10px]">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right text-gray-300">{value}</dd>
    </div>
  )
}

function Pct({ value, greenRed = false }: { value: number | undefined; greenRed?: boolean }) {
  if (value == null) return <span className="text-gray-500">—</span>
  const pct = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  if (greenRed) {
    const cls = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'
    return <span className={cls}>{pct}</span>
  }
  return <span className="text-gray-300">{pct}</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 first:mt-0">
      <h3 className="text-[10px] font-medium uppercase text-gray-500">{title}</h3>
      <div className="mt-1.5 space-y-1">{children}</div>
    </section>
  )
}

export function CompanySnapshot({
  tickerSymbol,
  data,
  stockPrice,
  performance,
  brokerConsensus,
}: CompanySnapshotProps) {
  if (!tickerSymbol) {
    return (
      <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
        <h3 className="text-[10px] uppercase text-gray-500">Company snapshot</h3>
        <p className="mt-1 text-xs text-gray-500">Select a ticker or signal to see fundamentals.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
        <h3 className="text-[10px] uppercase text-gray-500">Company snapshot · {tickerSymbol}</h3>
        <p className="mt-1 text-xs text-gray-500">No fundamentals data for this ticker.</p>
      </div>
    )
  }

  const hasActivity =
    stockPrice &&
    (stockPrice.currentPrice != null ||
      stockPrice.dailyChangePercent != null ||
      stockPrice.bid != null ||
      stockPrice.volume != null)
  const hasPerformance = performance && (performance.week1 != null || performance.year1 != null)
  const hasBroker = brokerConsensus && (brokerConsensus.buyCount + brokerConsensus.holdCount + brokerConsensus.sellCount > 0)

  const formatNum = (n: number | undefined) => (n == null ? '—' : n.toLocaleString())
  const formatMoney = (n: number | undefined) => (n == null ? '—' : `$${n.toFixed(2)}`)
  const formatLastTrade = (s: string | undefined) => {
    if (!s) return '—'
    try {
      const d = new Date(s)
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '—'
    }
  }

  return (
    <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
      <h3 className="text-[10px] uppercase text-gray-500">Company snapshot</h3>
      <p className="mt-1 text-xs font-medium text-gray-200">{data.companyName}</p>

      {hasActivity && stockPrice && (
        <Section title="Share price activity">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Last</span>
              <span className="text-gray-300">{formatMoney(stockPrice.currentPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Change (%)</span>
              <Pct value={stockPrice.dailyChangePercent} greenRed />
            </div>
            {stockPrice.bid != null && <Row label="Bid" value={formatMoney(stockPrice.bid)} />}
            {stockPrice.ask != null && <Row label="Ask" value={formatMoney(stockPrice.ask)} />}
            {stockPrice.volume != null && <Row label="Volume" value={formatNum(stockPrice.volume)} />}
            {stockPrice.volume4wAvg != null && <Row label="Vol 4w avg" value={formatNum(stockPrice.volume4wAvg)} />}
            {stockPrice.turnover != null && <Row label="Turnover" value={`$${(stockPrice.turnover / 1e9).toFixed(2)}B`} />}
            {stockPrice.open != null && <Row label="Open" value={formatMoney(stockPrice.open)} />}
            {stockPrice.dayHigh != null && stockPrice.dayLow != null && (
              <Row label="Day range" value={`${formatMoney(stockPrice.dayLow)} – ${formatMoney(stockPrice.dayHigh)}`} />
            )}
            {stockPrice.vwap != null && <Row label="VWAP" value={formatMoney(stockPrice.vwap)} />}
            {stockPrice.prevClose != null && <Row label="Prev close" value={formatMoney(stockPrice.prevClose)} />}
            <div className="flex justify-between">
              <span className="text-gray-500">Last trade</span>
              <span className={stockPrice.dailyChangePercent != null && stockPrice.dailyChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatLastTrade(stockPrice.lastTradeTime)}
              </span>
            </div>
          </div>
        </Section>
      )}

      {hasPerformance && performance && (
        <Section title="Performance">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-500">1 Week</span>
              <Pct value={performance.week1} greenRed />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">1 Month</span>
              <Pct value={performance.month1} greenRed />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">YTD</span>
              <Pct value={performance.ytd} greenRed />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">1 Year</span>
              <Pct value={performance.year1} greenRed />
            </div>
            {performance.vsSector1y != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">vs Sector (1yr)</span>
                <Pct value={performance.vsSector1y} greenRed />
              </div>
            )}
            {performance.vsIndex1y != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">vs Index (1yr)</span>
                <Pct value={performance.vsIndex1y} greenRed />
              </div>
            )}
          </div>
        </Section>
      )}

      <Section title="Key fundamentals">
        <dl className="space-y-1">
          <Row label="Exchange" value={data.exchange} />
          <Row label="Sector" value={data.sector} />
          <Row label="Industry" value={data.industry} />
          <Row label="Market cap" value={data.marketCap} />
          <Row label="P/E" value={data.peRatio} />
          <Row label="EV/EBITDA" value={data.evEbitda} />
          <Row label="EPS" value={data.eps} />
          <Row label="DPS" value={data.dps} />
          <Row label="Book value/share" value={data.bookValuePerShare} />
          <Row label="52w range" value={`${data.week52Low} – ${data.week52High}`} />
          <Row label="Revenue growth" value={data.revenueGrowth} />
          <Row label="Gross margin" value={data.grossMargin} />
          <Row label="Next earnings" value={data.nextEarnings} />
          <Row label="Beta" value={data.beta} />
          <Row label="Dividend yield" value={data.dividendYield ?? undefined} />
          <Row label="Similar companies" value={data.similarCompanies ?? undefined} />
        </dl>
      </Section>

      <Section title="Size">
        <Row label="Market cap" value={data.marketCap} />
        {data.marketRank != null && <Row label="Rank" value={data.marketRank} />}
        {data.sectorRank != null && <Row label="Sector rank" value={data.sectorRank} />}
      </Section>

      {hasBroker && brokerConsensus && (
        <Section title="Broker consensus">
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Breakdown</span>
              <span className="text-gray-300">
                Buy {brokerConsensus.buyCount} · Hold {brokerConsensus.holdCount} · Sell {brokerConsensus.sellCount}
              </span>
            </div>
            <Row label="Recommendation" value={brokerConsensus.recommendation} />
            <Row label="Last updated" value={brokerConsensus.lastUpdated} />
          </div>
        </Section>
      )}
    </div>
  )
}
