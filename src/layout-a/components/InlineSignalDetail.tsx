import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, MessageSquare } from 'lucide-react'
import type { Signal, StockPriceData, CompanyFundamentals, SnapshotPerformance, BrokerConsensus } from '../types'
import { MarketReactionModule, type ChartTimeframe } from './MarketReactionModule'
import { CompanySnapshot } from './CompanySnapshot'

type SignalDetailTab = 'summary' | 'evidence' | 'history'

interface InlineSignalDetailProps {
  signal: Signal
  lang: 'en' | 'zh'
  displayTicker: string | null
  stockPrice: StockPriceData | null
  fundamentals: CompanyFundamentals | null
  performance: SnapshotPerformance | null
  brokerConsensus: BrokerConsensus | null
  onAskAboutSignal?: (signalId: string, summary?: string) => void
}

export function InlineSignalDetail({
  signal,
  lang,
  displayTicker,
  stockPrice,
  fundamentals,
  performance,
  brokerConsensus,
  onAskAboutSignal,
}: InlineSignalDetailProps) {
  const [tab, setTab] = useState<SignalDetailTab>('summary')
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1D')

  useEffect(() => {
    setTab('summary')
  }, [signal.id])

  return (
    <div className="border-t border-charcoal-600/80">
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-600/80 px-3 py-2">
        {onAskAboutSignal && (
          <button
            type="button"
            onClick={() => onAskAboutSignal(signal.id, lang === 'zh' ? signal.summaryZh : signal.summaryEn)}
            className="flex items-center gap-1.5 text-xs text-accent-gold hover:underline"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask StockClaw about this signal
          </button>
        )}
        {displayTicker && (
          <Link
            to={`/stock/${displayTicker}`}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent-gold"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View full stock details
          </Link>
        )}
      </div>
      <div className="flex border-b border-charcoal-600/80">
        {(['summary', 'evidence', 'history'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[10px] font-medium uppercase transition-colors ${
              tab === t ? 'border-b-2 border-accent-gold text-accent-gold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'summary' ? 'Summary' : t === 'evidence' ? 'Evidence' : 'History'}
          </button>
        ))}
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-3 space-y-3">
        {tab === 'summary' && (
          <>
            <section>
              <h3 className="text-[10px] uppercase text-gray-500">Why it matters</h3>
              <p className="mt-1 text-xs text-gray-300">{signal.whyItMatters}</p>
            </section>
            <section>
              <h3 className="text-[10px] uppercase text-gray-500">Reasoning chain</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs text-gray-300">
                {signal.reasoningSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
            {displayTicker && (
              <section>
                <MarketReactionModule
                  tickerSymbol={displayTicker}
                  data={stockPrice}
                  timeframe={chartTimeframe}
                  onTimeframeChange={setChartTimeframe}
                />
              </section>
            )}
            {displayTicker && (
              <section>
                <CompanySnapshot
                  tickerSymbol={displayTicker}
                  data={fundamentals}
                  stockPrice={stockPrice}
                  performance={performance}
                  brokerConsensus={brokerConsensus}
                />
              </section>
            )}
          </>
        )}
        {tab === 'evidence' && (
          <div>
            <h3 className="text-[10px] uppercase text-gray-500">Evidence transparency</h3>
            <dl className="mt-2 space-y-1 text-[10px]">
              <div className="flex justify-between"><dt className="text-gray-500">Source type</dt><dd className="text-gray-300">{signal.evidenceMeta.sourceType}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Source publish</dt><dd className="text-gray-300">{signal.evidenceMeta.sourcePublishTime}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Extraction time</dt><dd className="text-gray-300">{signal.evidenceMeta.extractionTime}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Ticker matching</dt><dd className="text-gray-300">{signal.evidenceMeta.tickerMatchingLogic}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Confidence</dt><dd className="text-gray-300">{signal.evidenceMeta.confidence}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Relevance</dt><dd className="text-gray-300">{signal.evidenceMeta.relevance}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Related evidence</dt><dd className="text-gray-300">{signal.evidenceMeta.relatedEvidenceCount}</dd></div>
            </dl>
          </div>
        )}
        {tab === 'history' && (
          <div>
            <h3 className="text-[10px] uppercase text-gray-500">Related historical signals</h3>
            <ul className="mt-2 space-y-2">
              {signal.relatedHistory.map((h, i) => (
                <li key={i} className="rounded border border-charcoal-600 bg-charcoal-900 p-2 text-[10px]">
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
  )
}
