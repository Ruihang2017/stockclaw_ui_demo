import type { CompanyFundamentals } from '../types'

interface CompanySnapshotProps {
  tickerSymbol: string | null
  data: CompanyFundamentals | null
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

export function CompanySnapshot({ tickerSymbol, data }: CompanySnapshotProps) {
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

  return (
    <div className="rounded border border-charcoal-600 bg-charcoal-800 p-3">
      <h3 className="text-[10px] uppercase text-gray-500">Company snapshot</h3>
      <p className="mt-1 text-xs font-medium text-gray-200">{data.companyName}</p>
      <dl className="mt-2 space-y-1">
        <Row label="Exchange" value={data.exchange} />
        <Row label="Sector" value={data.sector} />
        <Row label="Industry" value={data.industry} />
        <Row label="Market cap" value={data.marketCap} />
        <Row label="P/E" value={data.peRatio} />
        <Row label="EV/EBITDA" value={data.evEbitda} />
        <Row label="52w range" value={`${data.week52Low} – ${data.week52High}`} />
        <Row label="Revenue growth" value={data.revenueGrowth} />
        <Row label="Gross margin" value={data.grossMargin} />
        <Row label="Next earnings" value={data.nextEarnings} />
        <Row label="Beta" value={data.beta} />
        <Row label="Dividend yield" value={data.dividendYield ?? undefined} />
      </dl>
    </div>
  )
}
