import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronDown, RefreshCw, LayoutGrid, List } from 'lucide-react'
import type { Signal } from '../types'
import { SignalCard } from './SignalCard'
import { RAGModule } from './RAGModule'

type SortBy = 'newest' | 'oldest' | 'urgency' | 'impact'

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
  onOpenSignalFromRAG?: (signalId: string) => void
  onRefresh?: () => void
}

export function CenterPanel({
  signals,
  selectedTicker,
  selectedSignalId,
  lang,
  onSelectSignal,
  onOpenSignalFromRAG,
  onRefresh,
}: CenterPanelProps) {
  const [feedViewMode, setFeedViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
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
                    setSortBy(key)
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
            onClick={() => setFeedViewMode('list')}
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
            onClick={() => setFeedViewMode('grid')}
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
        <span className="text-gray-500">ticker</span>
        <span className="text-gray-500">agent</span>
        <span className="text-gray-500">urgency</span>
        <span className="text-gray-500">sentiment</span>
        <span className="text-gray-500">source type</span>
        <span className="text-gray-500">language</span>
        <span className="text-gray-500">time range</span>
        <button type="button" className="text-gray-500 hover:text-gray-300">clear all</button>
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
          {sortedSignals.map((s) => (
            <SignalCard
              key={s.id}
              signal={s}
              isSelected={selectedSignalId === s.id}
              lang={lang}
              onSelect={() => onSelectSignal(s.id)}
            />
          ))}
        </div>

        {/* RAG module */}
        <div className="mt-6">
          <RAGModule lang={lang} onOpenSignal={onOpenSignalFromRAG} />
        </div>
      </div>
    </main>
  )
}
