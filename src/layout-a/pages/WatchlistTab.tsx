import { useMemo } from 'react'
import { LeftPanel } from '../components/LeftPanel'
import { useDashboardState, DEFAULT_WATCHLIST_SETTINGS } from '../context/DashboardStateContext'
import { WATCHLIST_BY_ID, MOCK_WATCHLISTS, ADDABLE_TICKERS } from '../mockData'
import type { WatchlistTicker } from '../types'

export function WatchlistTab() {
  const {
    activeWatchlistId, setActiveWatchlistId,
    watchlistEdits, setWatchlistEdits,
    watchlistNameOverrides, setWatchlistNameOverrides,
    watchlistSettings, setWatchlistSettings,
    customWatchlists,
    pendingRenameWatchlistId, setPendingRenameWatchlistId,
    selectedTicker, setSelectedTicker,
    activeFilter,
    addWatchlist, deleteWatchlist,
    handleFilterChange, handleAskAI,
  } = useDashboardState()

  const baseWatchlistData = WATCHLIST_BY_ID[activeWatchlistId]
  const baseTickers = baseWatchlistData?.tickers ?? []

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

  const summary = baseWatchlistData?.summary ?? {
    name: watchlistNameOverrides[activeWatchlistId] ??
      customWatchlists.find((w) => w.id === activeWatchlistId)?.name ??
      'New Watchlist',
    trackedCount: 0,
    signalsToday: 0,
    breakingCount: 0,
    bullishRatio: 0,
    mostActiveAgent: '',
  }
  const displaySummary = {
    ...summary,
    name: watchlistNameOverrides[activeWatchlistId] ?? summary.name,
    trackedCount: displayTickers.length,
  }

  const watchlistOptionsWithOverrides = [
    ...MOCK_WATCHLISTS.map((w) => ({ ...w, name: watchlistNameOverrides[w.id] ?? w.name })),
    ...customWatchlists.map((w) => ({ ...w, name: watchlistNameOverrides[w.id] ?? w.name })),
  ]

  const addableTickers = ADDABLE_TICKERS.filter(
    (t) => !displayTickers.some((d) => d.symbol === t.symbol),
  )

  const handleRemoveTicker = (symbol: string) => {
    setWatchlistEdits((prev) => {
      const current = prev[activeWatchlistId] ?? { removed: [], added: [] }
      return { ...prev, [activeWatchlistId]: { ...current, removed: [...current.removed, symbol] } }
    })
    if (selectedTicker === symbol) setSelectedTicker(null)
  }

  const handleAddTicker = (ticker: WatchlistTicker) => {
    setWatchlistEdits((prev) => {
      const current = prev[activeWatchlistId] ?? { removed: [], added: [] }
      return { ...prev, [activeWatchlistId]: { ...current, added: [...current.added, ticker] } }
    })
  }

  const handleReorderTicker = (newOrder: string[]) => {
    setWatchlistEdits((prev) => {
      const current = prev[activeWatchlistId] ?? { removed: [], added: [] }
      return { ...prev, [activeWatchlistId]: { ...current, order: newOrder } }
    })
  }

  return (
    <LeftPanel
      variant="full"
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
  )
}
