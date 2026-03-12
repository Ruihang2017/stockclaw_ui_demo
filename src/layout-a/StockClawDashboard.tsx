import { useState, useMemo } from 'react'
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
import { WATCHLIST_BY_ID, MOCK_WATCHLISTS, MOCK_NOTIFICATIONS, ADDABLE_TICKERS, SIGNALS, MARKET_INDEXES, MARKET_PULSE_ITEMS } from './mockData'
import type { FilterChipId, UserSettings, WatchlistTicker, WatchlistSettings, ChatContext, FeedFilters, FeedTimeRange } from './types'
import { useChat } from './context/ChatContext'
import { DEFAULT_WATCHLIST_SETTINGS } from './types'

function chipToFeedFilters(chipId: FilterChipId): Partial<FeedFilters> {
  switch (chipId) {
    case 'all':
      return {}
    case 'breaking':
      return { urgency: 'BREAKING' }
    case 'bullish':
      return { sentiment: 'bullish' }
    case 'bearish':
      return { sentiment: 'bearish' }
    case 'macro':
      return { category: 'Macro' }
    case 'earnings':
      return { category: 'Earnings' }
    case 'policy':
      return { category: 'Policy' }
    default:
      return {}
  }
}

function isWithinTimeRange(publishedAt: string, timeRange: FeedTimeRange): boolean {
  const pub = new Date(publishedAt).getTime()
  const now = Date.now()
  const ms = timeRange === '24h' ? 24 * 60 * 60 * 1000 : timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
  return now - pub <= ms
}

export function StockClawDashboard() {
  const navigate = useNavigate()
  const { activeMessages, sendMessage, newChat } = useChat()
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('swing')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    dateFormat: 'relative',
    emailDigest: true,
    push: false,
    breakingOnly: false,
  })
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(SIGNALS[0]?.id ?? null)
  const [lang, setLang] = useState<'en' | 'zh'>('en')
  const [activeFilter, setActiveFilter] = useState<FilterChipId>('all')
  const [feedFilters, setFeedFilters] = useState<FeedFilters>({})
  const [lastUpdated, setLastUpdated] = useState('8s ago')
  const [watchlistEdits, setWatchlistEdits] = useState<Record<string, { removed: string[]; added: WatchlistTicker[]; order?: string[] }>>({})
  const [watchlistNameOverrides, setWatchlistNameOverrides] = useState<Record<string, string>>({})
  const [watchlistSettings, setWatchlistSettings] = useState<Record<string, WatchlistSettings>>({})
  const [customWatchlists, setCustomWatchlists] = useState<{ id: string; name: string }[]>([])
  const [pendingRenameWatchlistId, setPendingRenameWatchlistId] = useState<string | null>(null)
  const [ragPrompt, setRagPrompt] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatContext, setChatContext] = useState<ChatContext | null>(null)
  const [pinnedSignalIds, setPinnedSignalIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('stockclaw_pinned')
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })
  const [readSignalIds, setReadSignalIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('stockclaw_read')
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })
  const [feedListView, setFeedListView] = useState<'all' | 'unread' | 'pinned'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgency' | 'impact'>(() => {
    try {
      const s = localStorage.getItem('stockclaw_feed_preferences')
      const p = s ? JSON.parse(s) : null
      return (p?.sortBy === 'oldest' || p?.sortBy === 'urgency' || p?.sortBy === 'impact') ? p.sortBy : 'newest'
    } catch { return 'newest' }
  })
  const [feedViewMode, setFeedViewMode] = useState<'list' | 'grid'>(() => {
    try {
      const s = localStorage.getItem('stockclaw_feed_preferences')
      const p = s ? JSON.parse(s) : null
      return p?.feedViewMode === 'grid' ? 'grid' : 'list'
    } catch { return 'list' }
  })

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

  const handleAddWatchlist = () => {
    const id = `custom-${Date.now()}`
    setCustomWatchlists((prev) => [...prev, { id, name: 'New Watchlist' }])
    setActiveWatchlistId(id)
    setPendingRenameWatchlistId(id)
  }

  const handleDeleteWatchlist = (id: string) => {
    setCustomWatchlists((prev) => prev.filter((w) => w.id !== id))
    if (activeWatchlistId === id) {
      setActiveWatchlistId(MOCK_WATCHLISTS[0]?.id ?? 'swing')
    }
    setWatchlistNameOverrides((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setWatchlistSettings((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setWatchlistEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

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

  const handleAskAI = (query: string, ticker?: string) => {
    setRagPrompt(query)
    if (ticker) setChatContext({ type: 'ticker', symbol: ticker })
    setChatOpen(true)
  }

  const handleAskAboutSignal = (signalId: string, summary?: string) => {
    setChatContext({ type: 'signal', signalId, summary })
    setRagPrompt('Explain this signal in more detail')
    setChatOpen(true)
  }

  const handleSearchSubmit = (query: string) => {
    navigate('/chat', { state: { initialQuery: query } })
  }

  const handleChatClose = () => {
    setChatOpen(false)
    setChatContext(null)
  }

  const handleRefresh = () => {
    setLastUpdated('just now')
    setTimeout(() => setLastUpdated('8s ago'), 2500)
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
  }, [selectedTicker, feedFilters])

  const handleFilterChange = (chipId: FilterChipId) => {
    setActiveFilter(chipId)
    setFeedFilters((prev) => ({ ...prev, ...chipToFeedFilters(chipId) }))
  }

  const handleClearFilters = () => {
    setActiveFilter('all')
    setFeedFilters({})
    setSelectedTicker(null)
  }

  const handlePin = (signalId: string) => {
    setPinnedSignalIds((prev) => {
      const next = prev.includes(signalId) ? prev.filter((id) => id !== signalId) : [...prev, signalId]
      try { localStorage.setItem('stockclaw_pinned', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const handleMarkRead = (signalId: string) => {
    setReadSignalIds((prev) => {
      const next = prev.includes(signalId) ? prev.filter((id) => id !== signalId) : [...prev, signalId]
      try { localStorage.setItem('stockclaw_read', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const signalsAfterListView = useMemo(() => {
    if (feedListView === 'unread') return filteredSignals.filter((s) => !readSignalIds.includes(s.id))
    if (feedListView === 'pinned') return filteredSignals.filter((s) => pinnedSignalIds.includes(s.id))
    return filteredSignals
  }, [filteredSignals, feedListView, readSignalIds, pinnedSignalIds])

  const persistFeedPreferences = (updates: { sortBy?: typeof sortBy; feedViewMode?: typeof feedViewMode }) => {
    try {
      const s = localStorage.getItem('stockclaw_feed_preferences')
      const p = s ? JSON.parse(s) : {}
      const next = { ...p, ...updates }
      localStorage.setItem('stockclaw_feed_preferences', JSON.stringify(next))
    } catch {}
  }

  const handleSortByChange = (v: 'newest' | 'oldest' | 'urgency' | 'impact') => {
    setSortBy(v)
    persistFeedPreferences({ sortBy: v })
  }

  const handleFeedViewModeChange = (v: 'list' | 'grid') => {
    setFeedViewMode(v)
    persistFeedPreferences({ feedViewMode: v })
  }

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

  return (
    <div className="flex h-screen flex-col bg-charcoal-950 text-gray-200">
      <Header
        newSignalsCount={watchlistSummary.signalsToday}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
        onOpenSettings={() => setSettingsOpen(true)}
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
          onAddWatchlist={handleAddWatchlist}
          onRenameWatchlist={(id, newName) => setWatchlistNameOverrides((prev) => ({ ...prev, [id]: newName }))}
          pendingRenameWatchlistId={pendingRenameWatchlistId}
          onClearPendingRename={() => setPendingRenameWatchlistId(null)}
          canDeleteWatchlist={customWatchlists.some((w) => w.id === activeWatchlistId)}
          onDeleteWatchlist={handleDeleteWatchlist}
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
        />
        <RightPanel
          displayTicker={displayTicker}
        />
      </div>

      {settingsOpen && (
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
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
