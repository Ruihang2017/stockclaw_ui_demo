import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './components/Header'
import { StatusStrip } from './components/StatusStrip'
import { MarketContextStrip } from './components/MarketContextStrip'
import { MarketPulseStrip } from './components/MarketPulseStrip'
import { LeftPanel } from './components/LeftPanel'
import { CenterPanel } from './components/CenterPanel'
import { RightPanel } from './components/RightPanel'
import { SettingsModal } from './components/SettingsModal'
import { HelpModal } from './components/HelpModal'
import { ChatSlideOver } from './components/ChatSlideOver'
import {
  WATCHLIST_BY_ID,
  MOCK_WATCHLISTS,
  MOCK_NOTIFICATIONS,
  ADDABLE_TICKERS,
  SIGNALS,
  MARKET_INDEXES,
  MARKET_PULSE_ITEMS,
  STOCK_PRICE_BY_SYMBOL,
  COMPANY_FUNDAMENTALS_BY_SYMBOL,
  SNAPSHOT_PERFORMANCE_BY_SYMBOL,
  BROKER_CONSENSUS_BY_SYMBOL,
} from './mockData'
import type { WatchlistTicker } from './types'
import { useChat } from './context/ChatContext'
import { useDashboardState, DEFAULT_WATCHLIST_SETTINGS } from './context/DashboardStateContext'

export function StockClawDashboard() {
  const navigate = useNavigate()
  const { activeMessages, sendMessage, newChat } = useChat()
  const {
    activeWatchlistId, setActiveWatchlistId,
    watchlistEdits, setWatchlistEdits,
    watchlistNameOverrides, setWatchlistNameOverrides,
    watchlistSettings, setWatchlistSettings,
    customWatchlists,
    pendingRenameWatchlistId, setPendingRenameWatchlistId,
    selectedTicker, setSelectedTicker,
    selectedSignalId, setSelectedSignalId,
    pinnedSignalIds, readSignalIds,
    activeFilter, feedFilters, setFeedFilters,
    feedListView, setFeedListView,
    sortBy, feedViewMode,
    userSettings, setUserSettings,
    lang, setLang,
    lastUpdated,
    ragPrompt, setRagPrompt,
    chatContext, setChatContext,
    chatOpen, setChatOpen,
    helpOpen, setHelpOpen,
    notificationsOpen, setNotificationsOpen,
    isWithinTimeRange,
    addWatchlist, deleteWatchlist,
    handleFilterChange, handleClearFilters,
    handlePin, handleMarkRead,
    handleSortByChange, handleFeedViewModeChange,
    handleRefresh, handleAskAI, handleAskAboutSignal, handleChatClose,
  } = useDashboardState()

  const baseWatchlistData = WATCHLIST_BY_ID[activeWatchlistId]
  const watchlistSummary = baseWatchlistData?.summary ?? {
    name: watchlistNameOverrides[activeWatchlistId] ?? customWatchlists.find((w) => w.id === activeWatchlistId)?.name ?? 'New Watchlist',
    trackedCount: 0,
    signalsToday: 0,
    breakingCount: 0,
    bullishRatio: 0,
    mostActiveAgent: '',
  }
  const baseWatchlistTickers = baseWatchlistData?.tickers ?? []

  const displayTickers = useMemo(() => {
    const base = baseWatchlistTickers ?? []
    const edits = watchlistEdits[activeWatchlistId]
    const removed = edits?.removed ?? []
    const added = edits?.added ?? []
    const order = edits?.order
    const list = [...base.filter((t) => !removed.includes(t.symbol)), ...added]
    if (!order?.length) return list
    const orderSet = new Set(order)
    const tickerBySymbol = new Map(list.map((t) => [t.symbol, t]))
    const inOrder = order.filter((s) => tickerBySymbol.has(s)).map((s) => tickerBySymbol.get(s)!)
    const rest = list.filter((t) => !orderSet.has(t.symbol))
    return [...inOrder, ...rest]
  }, [activeWatchlistId, baseWatchlistTickers, watchlistEdits])

  const displaySummary = useMemo(() => {
    if (!watchlistSummary) return watchlistSummary
    return {
      ...watchlistSummary,
      name: watchlistNameOverrides[activeWatchlistId] ?? watchlistSummary.name,
      trackedCount: displayTickers.length,
    }
  }, [watchlistSummary, activeWatchlistId, watchlistNameOverrides, displayTickers.length])

  const watchlistOptionsWithOverrides = useMemo(
    () => [
      ...MOCK_WATCHLISTS.map((w) => ({ ...w, name: watchlistNameOverrides[w.id] ?? w.name })),
      ...customWatchlists.map((w) => ({ ...w, name: watchlistNameOverrides[w.id] ?? w.name })),
    ],
    [watchlistNameOverrides, customWatchlists]
  )

  const addableTickers = useMemo(
    () => ADDABLE_TICKERS.filter((t) => !displayTickers.some((d) => d.symbol === t.symbol)),
    [displayTickers]
  )

  const handleRemoveTicker = (symbol: string) => {
    setWatchlistEdits((prev) => {
      const id = activeWatchlistId
      const current = prev[id] ?? { removed: [], added: [] }
      return {
        ...prev,
        [id]: { ...current, removed: [...current.removed, symbol] },
      }
    })
    if (selectedTicker === symbol) setSelectedTicker(null)
  }

  const handleAddTicker = (ticker: WatchlistTicker) => {
    setWatchlistEdits((prev) => {
      const id = activeWatchlistId
      const current = prev[id] ?? { removed: [], added: [] }
      return {
        ...prev,
        [id]: { ...current, added: [...current.added, ticker] },
      }
    })
  }

  const handleReorderTicker = (newOrder: string[]) => {
    setWatchlistEdits((prev) => {
      const id = activeWatchlistId
      const current = prev[id] ?? { removed: [], added: [] }
      return { ...prev, [id]: { ...current, order: newOrder } }
    })
  }

  const handleSearchSubmit = (query: string) => {
    navigate('/chat', { state: { initialQuery: query } })
  }

  const filteredSignals = useMemo(() => {
    let list = [...SIGNALS]
    if (selectedTicker) {
      list = list.filter((s) => s.tickers.includes(selectedTicker))
    }
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
    [selectedSignalId]
  )

  const displayTicker = selectedTicker ?? selectedSignal?.tickers?.[0] ?? null
  const detailStockPrice = displayTicker ? STOCK_PRICE_BY_SYMBOL[displayTicker] ?? null : null
  const detailFundamentals = displayTicker ? COMPANY_FUNDAMENTALS_BY_SYMBOL[displayTicker] ?? null : null
  const detailPerformance = displayTicker ? SNAPSHOT_PERFORMANCE_BY_SYMBOL[displayTicker] ?? null : null
  const detailBrokerConsensus = displayTicker ? BROKER_CONSENSUS_BY_SYMBOL[displayTicker] ?? null : null

  return (
    <div className="flex h-screen flex-col bg-charcoal-950 text-gray-200">
      <Header
        newSignalsCount={watchlistSummary.signalsToday}
        lang={lang}
        onLangToggle={() => setLang(lang === 'en' ? 'zh' : 'en')}
        onOpenSettings={() => { /* legacy handler, replaced in AppShell refactor */ }}
        onOpenNotifications={() => setNotificationsOpen((o) => !o)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenChat={() => navigate('/chat')}
        onSearchSubmit={handleSearchSubmit}
        notificationsOpen={notificationsOpen}
        onCloseNotifications={() => setNotificationsOpen(false)}
        notifications={MOCK_NOTIFICATIONS}
      />
      <StatusStrip
        lastUpdated={lastUpdated}
        newSignalsInWatchlist={watchlistSummary.signalsToday}
        breakingCount={watchlistSummary.breakingCount}
      />
      <MarketContextStrip indexes={MARKET_INDEXES} />
      <MarketPulseStrip items={MARKET_PULSE_ITEMS} />
      <div className="flex min-h-0 flex-1 flex-wrap">
        <LeftPanel
          summary={displaySummary}
          tickers={displayTickers}
          selectedTicker={selectedTicker}
          onSelectTicker={setSelectedTicker}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onRemoveTicker={handleRemoveTicker}
          addableTickers={addableTickers}
          onAddTicker={handleAddTicker}
          watchlistOptions={watchlistOptionsWithOverrides}
          activeWatchlistId={activeWatchlistId}
          onWatchlistSelect={setActiveWatchlistId}
          onAddWatchlist={addWatchlist}
          onRenameWatchlist={(id, newName) => setWatchlistNameOverrides((prev) => ({ ...prev, [id]: newName }))}
          pendingRenameWatchlistId={pendingRenameWatchlistId}
          onClearPendingRename={() => setPendingRenameWatchlistId(null)}
          canDeleteWatchlist={customWatchlists.some((w) => w.id === activeWatchlistId)}
          onDeleteWatchlist={deleteWatchlist}
          watchlistSettings={watchlistSettings[activeWatchlistId] ?? DEFAULT_WATCHLIST_SETTINGS}
          onWatchlistSettingsSave={(id, s) => setWatchlistSettings((prev) => ({ ...prev, [id]: s }))}
          onReorderTicker={handleReorderTicker}
          onAskAI={handleAskAI}
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
        <RightPanel
          displayTicker={displayTicker}
        />
      </div>

      {false && (
        <SettingsModal
          isOpen={false}
          onClose={() => { /* legacy - now SettingsTab */ }}
          lang={lang}
          onLangChange={setLang}
          dateFormat={userSettings.dateFormat}
          onDateFormatChange={(format) => setUserSettings((s) => ({ ...s, dateFormat: format }))}
          notificationToggles={{
            emailDigest: userSettings.emailDigest,
            push: userSettings.push,
            breakingOnly: userSettings.breakingOnly,
          }}
          onNotificationChange={(key, value) =>
            setUserSettings((s) => ({ ...s, [key]: value }))
          }
          defaultWatchlistId={activeWatchlistId}
          watchlistOptions={watchlistOptionsWithOverrides}
          onDefaultWatchlistChange={setActiveWatchlistId}
          feedbackHref="#feedback"
        />
      )}

      {helpOpen && (
        <HelpModal
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          feedbackHref="#feedback"
        />
      )}

      <ChatSlideOver
        isOpen={chatOpen}
        onClose={handleChatClose}
        onOpen={() => setChatOpen(true)}
        lang={lang}
        messages={activeMessages}
        onSendMessage={sendMessage}
        initialQuery={ragPrompt}
        initialContext={chatContext}
        onInitialConsumed={() => {
          setRagPrompt(null)
          setChatContext(null)
        }}
        onNewChat={newChat}
      />
    </div>
  )
}
