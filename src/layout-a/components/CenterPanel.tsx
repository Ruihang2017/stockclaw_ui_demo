import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronDown, RefreshCw, LayoutGrid, List } from 'lucide-react'
import type { Signal, StockPriceData, CompanyFundamentals, SnapshotPerformance, BrokerConsensus } from '../types'
import type { FeedFilters, FeedTimeRange } from '../types'
import { SignalCard } from './SignalCard'
import { InlineSignalDetail } from './InlineSignalDetail'

export type SortBy = 'newest' | 'oldest' | 'urgency' | 'impact'

export interface FeedFilterOptions {
  agents: string[]
  categories: string[]
  sources: string[]
}

const SORT_LABELS: Record<SortBy, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  urgency: 'By urgency',
  impact: 'By impact',
}

const URGENCY_ORDER: Record<string, number> = { BREAKING: 0, DIGEST: 1, FYI: 2 }

interface CenterPanelProps {
  signals: Signal[]
  selectedTicker: string | null
  selectedSignalId: string | null
  lang: 'en' | 'zh'
  onSelectSignal: (id: string) => void
  onRefresh?: () => void
  feedFilters?: FeedFilters
  onFeedFiltersChange?: (f: FeedFilters) => void
  onClearFilters?: () => void
  feedFilterOptions?: FeedFilterOptions
  pinnedSignalIds?: string[]
  readSignalIds?: string[]
  onPin?: (id: string) => void
  onMarkRead?: (id: string) => void
  feedListView?: 'all' | 'unread' | 'pinned'
  onFeedListViewChange?: (view: 'all' | 'unread' | 'pinned') => void
  sortBy?: SortBy
  onSortByChange?: (v: SortBy) => void
  feedViewMode?: 'list' | 'grid'
  onFeedViewModeChange?: (v: 'list' | 'grid') => void
  selectedSignal?: Signal | null
  onAskAboutSignal?: (signalId: string, summary?: string) => void
  detailDisplayTicker?: string | null
  detailStockPrice?: StockPriceData | null
  detailFundamentals?: CompanyFundamentals | null
  detailPerformance?: SnapshotPerformance | null
  detailBrokerConsensus?: BrokerConsensus | null
}

export function CenterPanel({
  signals,
  selectedTicker,
  selectedSignalId,
  lang,
  onSelectSignal,
  onRefresh,
  feedFilters = {},
  onFeedFiltersChange,
  onClearFilters,
  feedFilterOptions = { agents: [], categories: [], sources: [] },
  pinnedSignalIds = [],
  readSignalIds = [],
  onPin,
  onMarkRead,
  feedListView = 'all',
  onFeedListViewChange,
  sortBy: sortByProp = 'newest',
  onSortByChange,
  feedViewMode: feedViewModeProp = 'list',
  onFeedViewModeChange,
  selectedSignal = null,
  onAskAboutSignal,
  detailDisplayTicker = null,
  detailStockPrice = null,
  detailFundamentals = null,
  detailPerformance = null,
  detailBrokerConsensus = null,
}: CenterPanelProps) {
  const sortBy = sortByProp
  const feedViewMode = feedViewModeProp
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const contextLabel = selectedTicker ? `Filtered: ${selectedTicker}` : 'All watchlist'

  const sortedSignals = useMemo(() => {
    const list = [...signals]
    if (sortBy === 'newest') {
      list.sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1))
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => (a.publishedAt > b.publishedAt ? 1 : -1))
    } else if (sortBy === 'urgency') {
      list.sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 3) - (URGENCY_ORDER[b.urgency] ?? 3))
    } else {
      list.sort((a, b) => b.impactScore - a.impactScore)
    }
    return list
  }, [signals, sortBy])

  useEffect(() => {
    if (!sortDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sortDropdownOpen])

  return (
    <main className="flex min-w-[320px] flex-1 flex-col overflow-hidden">
      {/* Feed toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-600 bg-charcoal-900 p-2">
        <h2 className="text-sm font-medium text-gray-200">Signal Feed</h2>
        <span className="text-xs text-gray-500">{contextLabel}</span>
        {onFeedListViewChange && (
          <div className="flex gap-1">
            {(['all', 'unread', 'pinned'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => onFeedListViewChange(view)}
                className={`rounded border px-2 py-1 text-[10px] capitalize ${
                  feedListView === view
                    ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                    : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500 hover:text-gray-300'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        )}
        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => setSortDropdownOpen((o) => !o)}
            className="flex items-center gap-1 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1 text-xs text-gray-400 hover:border-charcoal-500 hover:text-gray-300"
          >
            <span>{SORT_LABELS[sortBy]}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {sortDropdownOpen && (
            <div className="absolute left-0 top-full z-10 mt-0.5 min-w-[160px] rounded border border-charcoal-600 bg-charcoal-800 py-1 shadow-panel">
              {(['newest', 'oldest', 'urgency', 'impact'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSortByChange?.(key)
                    setSortDropdownOpen(false)
                  }}
                  className={`flex w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-charcoal-700 ${
                    sortBy === key ? 'bg-charcoal-700 text-accent-gold' : 'text-gray-300'
                  }`}
                >
                  {SORT_LABELS[key]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onFeedViewModeChange?.('list')}
            className={`rounded border p-1 transition-colors ${
              feedViewMode === 'list'
                ? 'border-accent-gold bg-charcoal-700 text-accent-gold'
                : 'border-charcoal-600 text-gray-500 hover:bg-charcoal-700 hover:text-gray-300'
            }`}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onFeedViewModeChange?.('grid')}
            className={`rounded border p-1 transition-colors ${
              feedViewMode === 'grid'
                ? 'border-accent-gold bg-charcoal-700 text-accent-gold'
                : 'border-charcoal-600 text-gray-500 hover:bg-charcoal-700 hover:text-gray-300'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRefresh?.()}
          className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-600 bg-charcoal-800 px-3 py-2 text-[10px]">
        <span className="text-gray-500">agent</span>
        <select
          value={feedFilters.agent ?? ''}
          onChange={(e) => onFeedFiltersChange?.({ ...feedFilters, agent: e.target.value || undefined })}
          className="rounded border border-charcoal-600 bg-charcoal-900 px-1.5 py-0.5 text-gray-300 focus:border-charcoal-500 focus:outline-none"
        >
          <option value="">Any</option>
          {feedFilterOptions.agents.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <span className="text-gray-500">urgency</span>
        <select
          value={feedFilters.urgency ?? ''}
          onChange={(e) => onFeedFiltersChange?.({ ...feedFilters, urgency: (e.target.value || undefined) as FeedFilters['urgency'] })}
          className="rounded border border-charcoal-600 bg-charcoal-900 px-1.5 py-0.5 text-gray-300 focus:border-charcoal-500 focus:outline-none"
        >
          <option value="">Any</option>
          <option value="BREAKING">BREAKING</option>
          <option value="DIGEST">DIGEST</option>
          <option value="FYI">FYI</option>
        </select>
        <span className="text-gray-500">sentiment</span>
        <select
          value={feedFilters.sentiment ?? ''}
          onChange={(e) => onFeedFiltersChange?.({ ...feedFilters, sentiment: (e.target.value || undefined) as FeedFilters['sentiment'] })}
          className="rounded border border-charcoal-600 bg-charcoal-900 px-1.5 py-0.5 text-gray-300 focus:border-charcoal-500 focus:outline-none"
        >
          <option value="">Any</option>
          <option value="bullish">bullish</option>
          <option value="bearish">bearish</option>
          <option value="neutral">neutral</option>
        </select>
        <span className="text-gray-500">category</span>
        <select
          value={feedFilters.category ?? ''}
          onChange={(e) => onFeedFiltersChange?.({ ...feedFilters, category: e.target.value || undefined })}
          className="rounded border border-charcoal-600 bg-charcoal-900 px-1.5 py-0.5 text-gray-300 focus:border-charcoal-500 focus:outline-none"
        >
          <option value="">Any</option>
          {feedFilterOptions.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-gray-500">source</span>
        <select
          value={feedFilters.source ?? ''}
          onChange={(e) => onFeedFiltersChange?.({ ...feedFilters, source: e.target.value || undefined })}
          className="rounded border border-charcoal-600 bg-charcoal-900 px-1.5 py-0.5 text-gray-300 focus:border-charcoal-500 focus:outline-none"
        >
          <option value="">Any</option>
          {feedFilterOptions.sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-gray-500">time</span>
        <select
          value={feedFilters.timeRange ?? ''}
          onChange={(e) => onFeedFiltersChange?.({ ...feedFilters, timeRange: (e.target.value || undefined) as FeedTimeRange | undefined })}
          className="rounded border border-charcoal-600 bg-charcoal-900 px-1.5 py-0.5 text-gray-300 focus:border-charcoal-500 focus:outline-none"
        >
          <option value="">Any</option>
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>
        {onClearFilters && (
          <button type="button" onClick={onClearFilters} className="text-gray-500 hover:text-gray-300">clear all</button>
        )}
      </div>

      {/* Signal cards */}
      <div className="flex-1 overflow-y-auto p-3">
        <div
          className={
            feedViewMode === 'list'
              ? 'space-y-2'
              : 'grid grid-cols-1 gap-2 md:grid-cols-2'
          }
        >
          {sortedSignals.map((s) => {
            const isSelected = selectedSignalId === s.id && selectedSignal && selectedSignal.id === s.id
            const card = (
              <SignalCard
                signal={s}
                isSelected={selectedSignalId === s.id}
                lang={lang}
                onSelect={() => onSelectSignal(s.id)}
                isPinned={pinnedSignalIds.includes(s.id)}
                isRead={readSignalIds.includes(s.id)}
                onPin={onPin}
                onMarkRead={onMarkRead}
                hideBorder={isSelected}
              />
            )
            const expandedBlock = isSelected && selectedSignal && (
              <InlineSignalDetail
                signal={selectedSignal}
                lang={lang}
                displayTicker={detailDisplayTicker}
                stockPrice={detailStockPrice}
                fundamentals={detailFundamentals}
                performance={detailPerformance}
                brokerConsensus={detailBrokerConsensus}
                onAskAboutSignal={onAskAboutSignal}
              />
            )
            return (
              <div key={s.id} className={feedViewMode === 'grid' ? 'contents' : undefined}>
                {isSelected ? (
                  <div className={`rounded border border-charcoal-600 bg-charcoal-800 overflow-hidden ${feedViewMode === 'grid' ? 'md:col-span-2' : ''}`}>
                    {card}
                    {expandedBlock}
                  </div>
                ) : (
                  card
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
