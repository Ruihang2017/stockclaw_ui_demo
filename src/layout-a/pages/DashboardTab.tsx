import { useMemo } from 'react'
import { CenterPanel } from '../components/CenterPanel'
import { TickerChipStrip } from '../components/TickerChipStrip'
import { useDashboardState } from '../context/DashboardStateContext'
import {
  WATCHLIST_BY_ID,
  SIGNALS,
  STOCK_PRICE_BY_SYMBOL,
  COMPANY_FUNDAMENTALS_BY_SYMBOL,
  SNAPSHOT_PERFORMANCE_BY_SYMBOL,
  BROKER_CONSENSUS_BY_SYMBOL,
} from '../mockData'

export function DashboardTab() {
  const {
    activeWatchlistId,
    watchlistEdits,
    selectedTicker, setSelectedTicker,
    selectedSignalId, setSelectedSignalId,
    lang,
    feedFilters, setFeedFilters,
    feedListView, setFeedListView,
    sortBy, feedViewMode,
    pinnedSignalIds, readSignalIds,
    isWithinTimeRange,
    handleClearFilters,
    handlePin, handleMarkRead,
    handleSortByChange, handleFeedViewModeChange,
    handleRefresh, handleAskAboutSignal,
  } = useDashboardState()

  const baseTickers = WATCHLIST_BY_ID[activeWatchlistId]?.tickers ?? []
  const displayTickers = useMemo(() => {
    const edits = watchlistEdits[activeWatchlistId]
    const removed = edits?.removed ?? []
    const added = edits?.added ?? []
    const order = edits?.order
    const list = [...baseTickers.filter((t) => !removed.includes(t.symbol)), ...added]
    if (!order?.length) return list
    const orderSet = new Set(order)
    const bySymbol = new Map(list.map((t) => [t.symbol, t]))
    const inOrder = order.filter((s) => bySymbol.has(s)).map((s) => bySymbol.get(s)!)
    const rest = list.filter((t) => !orderSet.has(t.symbol))
    return [...inOrder, ...rest]
  }, [activeWatchlistId, baseTickers, watchlistEdits])

  const filteredSignals = useMemo(() => {
    let list = [...SIGNALS]
    if (selectedTicker) list = list.filter((s) => s.tickers.includes(selectedTicker))
    if (feedFilters.urgency) list = list.filter((s) => s.urgency === feedFilters.urgency)
    if (feedFilters.sentiment) list = list.filter((s) => s.sentiment === feedFilters.sentiment)
    if (feedFilters.agent) list = list.filter((s) => s.agent === feedFilters.agent)
    if (feedFilters.category) list = list.filter((s) => s.category === feedFilters.category)
    if (feedFilters.source) list = list.filter((s) => s.source === feedFilters.source)
    if (feedFilters.timeRange) list = list.filter((s) => isWithinTimeRange(s.publishedAt, feedFilters.timeRange!))
    return list
  }, [selectedTicker, feedFilters, isWithinTimeRange])

  const signalsAfterListView = useMemo(() => {
    if (feedListView === 'unread') return filteredSignals.filter((s) => !readSignalIds.includes(s.id))
    if (feedListView === 'pinned') return filteredSignals.filter((s) => pinnedSignalIds.includes(s.id))
    return filteredSignals
  }, [filteredSignals, feedListView, readSignalIds, pinnedSignalIds])

  const feedFilterOptions = useMemo(() => {
    const agents = new Set<string>()
    const categories = new Set<string>()
    const sources = new Set<string>()
    SIGNALS.forEach((s) => {
      agents.add(s.agent)
      categories.add(s.category)
      sources.add(s.source)
    })
    return { agents: [...agents].sort(), categories: [...categories].sort(), sources: [...sources].sort() }
  }, [])

  const selectedSignal = useMemo(
    () => SIGNALS.find((s) => s.id === selectedSignalId) ?? null,
    [selectedSignalId],
  )

  const displayTicker = selectedTicker ?? selectedSignal?.tickers?.[0] ?? null
  const detailStockPrice = displayTicker ? STOCK_PRICE_BY_SYMBOL[displayTicker] ?? null : null
  const detailFundamentals = displayTicker ? COMPANY_FUNDAMENTALS_BY_SYMBOL[displayTicker] ?? null : null
  const detailPerformance = displayTicker ? SNAPSHOT_PERFORMANCE_BY_SYMBOL[displayTicker] ?? null : null
  const detailBrokerConsensus = displayTicker ? BROKER_CONSENSUS_BY_SYMBOL[displayTicker] ?? null : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TickerChipStrip
        tickers={displayTickers}
        selectedTicker={selectedTicker}
        onSelectTicker={setSelectedTicker}
      />
      <CenterPanel
        signals={signalsAfterListView}
        selectedTicker={selectedTicker}
        selectedSignalId={selectedSignalId}
        lang={lang}
        onSelectSignal={setSelectedSignalId}
        onRefresh={handleRefresh}
        feedFilters={feedFilters}
        onFeedFiltersChange={setFeedFilters}
        onClearFilters={handleClearFilters}
        feedFilterOptions={feedFilterOptions}
        pinnedSignalIds={pinnedSignalIds}
        readSignalIds={readSignalIds}
        onPin={handlePin}
        onMarkRead={handleMarkRead}
        feedListView={feedListView}
        onFeedListViewChange={setFeedListView}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        feedViewMode={feedViewMode}
        onFeedViewModeChange={handleFeedViewModeChange}
        selectedSignal={selectedSignal}
        onAskAboutSignal={handleAskAboutSignal}
        detailDisplayTicker={displayTicker}
        detailStockPrice={detailStockPrice}
        detailFundamentals={detailFundamentals}
        detailPerformance={detailPerformance}
        detailBrokerConsensus={detailBrokerConsensus}
      />
    </div>
  )
}
