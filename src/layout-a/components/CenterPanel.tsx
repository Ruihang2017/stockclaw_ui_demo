import { ChevronDown, RefreshCw, LayoutGrid, List } from 'lucide-react'
import type { Signal } from '../types'
import { SignalCard } from './SignalCard'
import { RAGModule } from './RAGModule'

interface CenterPanelProps {
  signals: Signal[]
  selectedTicker: string | null
  selectedSignalId: string | null
  lang: 'en' | 'zh'
  onSelectSignal: (id: string) => void
  onOpenSignalFromRAG?: (signalId: string) => void
}

export function CenterPanel({
  signals,
  selectedTicker,
  selectedSignalId,
  lang,
  onSelectSignal,
  onOpenSignalFromRAG,
}: CenterPanelProps) {
  const contextLabel = selectedTicker ? `Filtered: ${selectedTicker}` : 'All watchlist'

  return (
    <main className="flex min-w-[320px] flex-1 flex-col overflow-hidden">
      {/* Feed toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-600 bg-charcoal-900 p-2">
        <h2 className="text-sm font-medium text-gray-200">Signal Feed</h2>
        <span className="text-xs text-gray-500">{contextLabel}</span>
        <div className="flex items-center gap-1 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1 text-xs">
          <span className="text-gray-400">Sort</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
        <div className="flex gap-1">
          <button type="button" className="rounded border border-charcoal-600 p-1 text-gray-500 hover:bg-charcoal-700" title="List view">
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rounded border border-charcoal-500 p-1 text-gray-400" title="Grid view">
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
        <button type="button" className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
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
        <div className="space-y-2">
          {signals.map((s) => (
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
