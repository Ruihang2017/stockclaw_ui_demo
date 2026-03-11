import { useState, useMemo } from 'react'
import { Header } from './components/Header'
import { StatusStrip } from './components/StatusStrip'
import { MarketContextStrip } from './components/MarketContextStrip'
import { MarketPulseStrip } from './components/MarketPulseStrip'
import { LeftPanel } from './components/LeftPanel'
import { CenterPanel } from './components/CenterPanel'
import { RightPanel } from './components/RightPanel'
import { SettingsModal } from './components/SettingsModal'
import { HelpModal } from './components/HelpModal'
import { WATCHLIST_BY_ID, MOCK_WATCHLISTS, MOCK_NOTIFICATIONS, ADDABLE_TICKERS, SIGNALS, MARKET_INDEXES, MARKET_PULSE_ITEMS } from './mockData'
import type { FilterChipId, UserSettings, WatchlistTicker, WatchlistSettings } from './types'
import { DEFAULT_WATCHLIST_SETTINGS } from './types'

export function StockClawDashboard() {
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
  const [lastUpdated, setLastUpdated] = useState('8s ago')
  const [watchlistEdits, setWatchlistEdits] = useState<Record<string, { removed: string[]; added: WatchlistTicker[]; order?: string[] }>>({})
  const [watchlistNameOverrides, setWatchlistNameOverrides] = useState<Record<string, string>>({})
  const [watchlistSettings, setWatchlistSettings] = useState<Record<string, WatchlistSettings>>({})
  const [customWatchlists, setCustomWatchlists] = useState<{ id: string; name: string }[]>([])
  const [pendingRenameWatchlistId, setPendingRenameWatchlistId] = useState<string | null>(null)
  const [ragPrompt, setRagPrompt] = useState<string | null>(null)

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

  const handleAskAI = (query: string) => {
    setRagPrompt(query)
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
        newSignalsCount={watchlistSummary.signalsToday}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenNotifications={() => setNotificationsOpen((o) => !o)}
        onOpenHelp={() => setHelpOpen(true)}
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
          onFilterChange={setActiveFilter}
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
          signals={filteredSignals}
          selectedTicker={selectedTicker}
          selectedSignalId={selectedSignalId}
          lang={lang}
          onSelectSignal={setSelectedSignalId}
          onOpenSignalFromRAG={handleOpenSignalFromRAG}
          onRefresh={handleRefresh}
          initialRagQuery={ragPrompt}
          onRagQueryConsumed={() => setRagPrompt(null)}
        />
        <RightPanel signal={selectedSignal} displayTicker={displayTicker} lang={lang} />
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
    </div>
  )
}
