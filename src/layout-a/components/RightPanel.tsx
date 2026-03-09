import { useState } from 'react'
import type { Signal } from '../types'
import { UrgencyBadge } from './UrgencyBadge'
import { MarketReactionModule, type ChartTimeframe } from './MarketReactionModule'
import { CompanySnapshot } from './CompanySnapshot'
import { STOCK_PRICE_BY_SYMBOL, COMPANY_FUNDAMENTALS_BY_SYMBOL } from '../mockData'

type RightTab = 'summary' | 'evidence' | 'history'

interface RightPanelProps {
  signal: Signal | null
  displayTicker: string | null
  lang: 'en' | 'zh'
}

export function RightPanel({ signal, displayTicker, lang }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightTab>('summary')
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1D')

  const stockPrice = displayTicker ? STOCK_PRICE_BY_SYMBOL[displayTicker] ?? null : null
  const fundamentals = displayTicker ? COMPANY_FUNDAMENTALS_BY_SYMBOL[displayTicker] ?? null : null

  if (!signal && !displayTicker) {
    return (
      <aside className="flex w-full flex-shrink-0 flex-col border-l border-charcoal-600 bg-charcoal-900 md:w-[400px]">
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-500">
          Select a signal or ticker to view details
        </div>
        <div className="border-t border-charcoal-600 p-3 text-[10px] text-gray-500">
          For informational purposes only. Not investment advice.
        </div>
      </aside>
    )
  }

  if (!signal && displayTicker) {
    return (
      <aside className="flex w-full flex-shrink-0 flex-col overflow-hidden border-l border-charcoal-600 bg-charcoal-900 md:w-[400px]">
        <div className="flex flex-1 flex-col overflow-y-auto p-3">
          <MarketReactionModule
            tickerSymbol={displayTicker}
            data={stockPrice}
            timeframe={chartTimeframe}
            onTimeframeChange={setChartTimeframe}
          />
          <div className="mt-3">
            <CompanySnapshot tickerSymbol={displayTicker} data={fundamentals} />
          </div>
        </div>
        <div className="border-t border-charcoal-600 p-3 text-[10px] text-gray-500">
          For informational purposes only. Not investment advice.
        </div>
      </aside>
    )
  }

  const summary = lang === 'zh' ? signal!.summaryZh : signal!.summaryEn

  const tabs: { id: RightTab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'history', label: 'History' },
  ]

  return (
    <aside className="flex w-full flex-shrink-0 flex-col overflow-hidden border-l border-charcoal-600 bg-charcoal-900 md:w-[400px]">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* A. Signal header */}
        <div className="border-b border-charcoal-600 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={signal!.urgency} />
            {signal!.tickers.map((t) => (
              <span key={t} className="text-xs text-gray-400">{t}</span>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            {signal!.publishedAt.replace('T', ' ')} · {signal!.agent} · {signal!.source} · {signal!.id}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-charcoal-600">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 py-2 text-[10px] font-medium uppercase transition-colors ${
                activeTab === id
                  ? 'border-b-2 border-accent-gold text-accent-gold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'summary' && (
            <div className="space-y-3 p-3">
              {/* B. Expanded summary */}
              <section>
                <h3 className="text-[10px] uppercase text-gray-500">Summary</h3>
                <p className="mt-1 text-sm text-gray-200">{summary}</p>
              </section>
              <section>
                <h3 className="text-[10px] uppercase text-gray-500">Why it matters</h3>
                <p className="mt-1 text-xs text-gray-300">{signal!.whyItMatters}</p>
              </section>
              {/* C. Market Reaction */}
              <MarketReactionModule
                tickerSymbol={displayTicker}
                data={stockPrice}
                timeframe={chartTimeframe}
                onTimeframeChange={setChartTimeframe}
              />
              {/* D. Reasoning Chain */}
              <section>
                <h3 className="text-[10px] uppercase text-gray-500">Reasoning chain</h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs text-gray-300">
                  {signal!.reasoningSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </section>
              {/* E. Company Snapshot */}
              <CompanySnapshot tickerSymbol={displayTicker} data={fundamentals} />
            </div>
          )}
          {activeTab === 'evidence' && (
            <div className="p-3">
              <h3 className="text-[10px] uppercase text-gray-500">Evidence transparency</h3>
              <dl className="mt-2 space-y-1 text-[10px]">
                <div className="flex justify-between"><dt className="text-gray-500">Source type</dt><dd className="text-gray-300">{signal!.evidenceMeta.sourceType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Source publish</dt><dd className="text-gray-300">{signal!.evidenceMeta.sourcePublishTime}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Extraction time</dt><dd className="text-gray-300">{signal!.evidenceMeta.extractionTime}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Ticker matching</dt><dd className="text-gray-300">{signal!.evidenceMeta.tickerMatchingLogic}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Confidence</dt><dd className="text-gray-300">{signal!.evidenceMeta.confidence}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Relevance</dt><dd className="text-gray-300">{signal!.evidenceMeta.relevance}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Related evidence</dt><dd className="text-gray-300">{signal!.evidenceMeta.relatedEvidenceCount}</dd></div>
              </dl>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="p-3">
              <h3 className="text-[10px] uppercase text-gray-500">Related historical signals</h3>
              <ul className="mt-2 space-y-2">
                {signal!.relatedHistory.map((h, i) => (
                  <li key={i} className="rounded border border-charcoal-600 bg-charcoal-800 p-2 text-[10px]">
                    <p className="text-gray-300">{h.summary}</p>
                    <p className="mt-1 text-gray-500">{h.date} · similarity {h.similarityScore}</p>
                    {h.marketReaction && <p className="text-gray-500">{h.marketReaction}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* H. Disclaimer */}
      <div className="border-t border-charcoal-600 p-3 text-[10px] text-gray-500">
        For informational purposes only. Not investment advice.
      </div>
    </aside>
  )
}
