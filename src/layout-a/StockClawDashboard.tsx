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
import type { FilterChipId, UserSettings, WatchlistTicker } from './types'

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
  const [watchlistEdits, setWatchlistEdits] = useState<Record<string, { removed: string[]; added: WatchlistTicker[] }>>({})

  const { summary: watchlistSummary, tickers: baseWatchlistTickers } = WATCHLIST_BY_ID[activeWatchlistId] ?? WATCHLIST_BY_ID['swing']

  const displayTickers = useMemo(() => {
    const base = baseWatchlistTickers ?? []
    const edits = watchlistEdits[activeWatchlistId]
    const removed = edits?.removed ?? []
    const added = edits?.added ?? []
    return [...base.filter((t) => !removed.includes(t.symbol)), ...added]
  }, [activeWatchlistId, baseWatchlistTickers, watchlistEdits])

  const displaySummary = useMemo(() => {
    if (!watchlistSummary) return watchlistSummary
    return { ...watchlistSummary, trackedCount: displayTickers.length }
  }, [watchlistSummary, displayTickers.length])

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
        watchlistOptions={MOCK_WATCHLISTS}
        activeWatchlistId={activeWatchlistId}
        onWatchlistSelect={setActiveWatchlistId}
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
        />
        <CenterPanel
          signals={filteredSignals}
          selectedTicker={selectedTicker}
          selectedSignalId={selectedSignalId}
          lang={lang}
          onSelectSignal={setSelectedSignalId}
          onOpenSignalFromRAG={handleOpenSignalFromRAG}
          onRefresh={handleRefresh}
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
          watchlistOptions={MOCK_WATCHLISTS}
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
