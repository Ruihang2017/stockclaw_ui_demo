import { useEffect, useRef, useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import type { RAGResult } from '../types'
import { RAG_MOCK } from '../mockData'

interface RAGModuleProps {
  lang: 'en' | 'zh'
  onOpenSignal?: (signalId: string) => void
  initialQuery?: string
  onQueryConsumed?: () => void
}

export function RAGModule({ lang, onOpenSignal, initialQuery, onQueryConsumed }: RAGModuleProps) {
  const data: RAGResult = RAG_MOCK
  const [query, setQuery] = useState(initialQuery ?? data.query)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      onQueryConsumed?.()
      inputRef.current?.focus()
    }
  }, [initialQuery, onQueryConsumed])

  const answerSummary = lang === 'zh' ? data.answerSummaryZh : data.answerSummary

  const tickersLabel = data.tickersInvolved?.length
    ? `Tickers: ${data.tickersInvolved.join(', ')}`
    : null
  const countLabel = `${data.supportingSignals.length} supporting signal${data.supportingSignals.length !== 1 ? 's' : ''}`

  return (
    <div className="rounded border border-charcoal-600 bg-charcoal-800 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-200">Historical Search</h3>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded border border-charcoal-600 bg-charcoal-900 px-2 py-1.5">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none"
            placeholder="Ask about historical signals..."
          />
        </div>
      </div>
      <div className="mt-3 rounded border border-charcoal-600 bg-charcoal-900 p-3">
        <p className="text-[10px] uppercase text-gray-500">Generated answer</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-200">{answerSummary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
          <span>Time range: {data.timeRange}</span>
          {tickersLabel != null && <span>{tickersLabel}</span>}
          <span>{countLabel}</span>
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-2 text-[10px] uppercase text-gray-500">Supporting evidence</p>
        <div className="space-y-2">
          {data.supportingSignals.map((s) => (
            <div
              key={s.signalId}
              className="flex flex-col gap-1 rounded border border-charcoal-600 bg-charcoal-900 p-2"
            >
              <p className="text-xs text-gray-200">{s.summary}</p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                <span>{s.date}</span>
                <span>{s.source}</span>
                <span>{s.ticker}</span>
                <span>Relevance {(s.relevance * 100).toFixed(0)}%</span>
              </div>
              {s.whyMatched && (
                <p className="text-[10px] text-gray-400 italic">Why matched: {s.whyMatched}</p>
              )}
              <button
                type="button"
                onClick={() => onOpenSignal?.(s.signalId)}
                className="mt-1 flex w-fit items-center gap-1 text-[10px] text-accent-gold hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Open original signal
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
