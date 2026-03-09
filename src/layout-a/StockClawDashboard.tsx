import { useState, useMemo } from 'react'
import { Header } from './components/Header'
import { StatusStrip } from './components/StatusStrip'
import { MarketContextStrip } from './components/MarketContextStrip'
import { LeftPanel } from './components/LeftPanel'
import { CenterPanel } from './components/CenterPanel'
import { RightPanel } from './components/RightPanel'
import { WATCHLIST_SUMMARY, SIGNALS, MARKET_INDEXES } from './mockData'
import type { FilterChipId } from './types'

export function StockClawDashboard() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(SIGNALS[0]?.id ?? null)
  const [lang, setLang] = useState<'en' | 'zh'>('en')
  const [activeFilter, setActiveFilter] = useState<FilterChipId>('all')

  const filteredSignals = useMemo(() => {
    let list = [...SIGNALS]
    if (selectedTicker) {
      list = list.filter((s) => s.tickers.includes(selectedTicker))
    }
    if (activeFilter === 'breaking') {
      list = list.filter((s) => s.urgency === 'BREAKING')
    } else if (activeFilter === 'bullish') {
      list = list.filter((s) => s.sentiment === 'bullish')
    } else if (activeFilter === 'bearish') {
      list = list.filter((s) => s.sentiment === 'bearish')
    }
    return list
  }, [selectedTicker, activeFilter])

  const selectedSignal = useMemo(
    () => SIGNALS.find((s) => s.id === selectedSignalId) ?? null,
    [selectedSignalId]
  )

  const displayTicker = selectedTicker ?? selectedSignal?.tickers?.[0] ?? null

  const handleOpenSignalFromRAG = (signalId: string) => {
    setSelectedSignalId(signalId)
  }

  return (
    <div className="flex h-screen flex-col bg-charcoal-950 text-gray-200">
      <Header
        watchlistName={WATCHLIST_SUMMARY.name}
        newSignalsCount={WATCHLIST_SUMMARY.signalsToday}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
      />
      <StatusStrip
        lastUpdated="8s ago"
        newSignalsInWatchlist={WATCHLIST_SUMMARY.signalsToday}
        breakingCount={WATCHLIST_SUMMARY.breakingCount}
      />
      <MarketContextStrip indexes={MARKET_INDEXES} />
      <div className="flex min-h-0 flex-1 flex-wrap">
        <LeftPanel
          selectedTicker={selectedTicker}
          onSelectTicker={setSelectedTicker}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <CenterPanel
          signals={filteredSignals}
          selectedTicker={selectedTicker}
          selectedSignalId={selectedSignalId}
          lang={lang}
          onSelectSignal={setSelectedSignalId}
          onOpenSignalFromRAG={handleOpenSignalFromRAG}
        />
        <RightPanel signal={selectedSignal} displayTicker={displayTicker} lang={lang} />
      </div>
    </div>
  )
}
