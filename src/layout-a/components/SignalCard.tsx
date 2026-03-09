import { ExternalLink, History, Pin, Check } from 'lucide-react'
import type { Signal } from '../types'
import type { SentimentBias } from '../types'
import { UrgencyBadge } from './UrgencyBadge'

interface SignalCardProps {
  signal: Signal
  isSelected: boolean
  lang: 'en' | 'zh'
  onSelect: () => void
}

function sentimentColor(s: SentimentBias) {
  return s === 'bullish' ? 'text-bullish' : s === 'bearish' ? 'text-bearish' : 'text-gray-400'
}

export function SignalCard({ signal, isSelected, lang, onSelect }: SignalCardProps) {
  const summary = lang === 'zh' ? signal.summaryZh : signal.summaryEn

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`cursor-pointer rounded border p-3 text-left transition-colors hover:border-charcoal-500 ${
        isSelected ? 'border-accent-gold/60 bg-charcoal-700/80 ring-1 ring-accent-gold/30' : 'border-charcoal-600 bg-charcoal-800'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <UrgencyBadge urgency={signal.urgency} />
        {signal.tickers.map((t) => (
          <span key={t} className="text-[10px] text-gray-500">
            {t}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-gray-500">{signal.relativeTime}</span>
        <span className="rounded bg-charcoal-600 px-1.5 py-0.5 text-[10px] text-gray-400">
          {signal.agent}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-gray-200">{summary}</p>
      <p className="mt-1 text-[10px] text-gray-500">{signal.category}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
        <span>{signal.source}</span>
        <span>{signal.publishedAt.slice(0, 16).replace('T', ' ')}</span>
        <span className={sentimentColor(signal.sentiment)}>{signal.sentiment}</span>
        <span>Impact {signal.impactScore}</span>
        <span>Conf {signal.confidence}</span>
        <span>{signal.id}</span>
        {signal.marketReactionHint && (
          <span className="text-accent-gold/80">{signal.marketReactionHint}</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-accent-gold">
          <ExternalLink className="h-3 w-3" /> open detail
        </button>
        <button type="button" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300">
          <History className="h-3 w-3" /> related history
        </button>
        <button type="button" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300">
          <Pin className="h-3 w-3" /> pin
        </button>
        <button type="button" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300">
          <Check className="h-3 w-3" /> mark read
        </button>
      </div>
    </article>
  )
}
