import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  WATCHLIST_BY_ID,
  MOCK_WATCHLISTS,
  SIGNALS,
} from '../mockData'
import type {
  FilterChipId,
  UserSettings,
  WatchlistTicker,
  WatchlistSettings,
  ChatContext,
  FeedFilters,
  FeedTimeRange,
} from '../types'
import { DEFAULT_WATCHLIST_SETTINGS } from '../types'

function chipToFeedFilters(chipId: FilterChipId): Partial<FeedFilters> {
  switch (chipId) {
    case 'all': return {}
    case 'breaking': return { urgency: 'BREAKING' }
    case 'bullish': return { sentiment: 'bullish' }
    case 'bearish': return { sentiment: 'bearish' }
    case 'macro': return { category: 'Macro' }
    case 'earnings': return { category: 'Earnings' }
    case 'policy': return { category: 'Policy' }
    default: return {}
  }
}

function isWithinTimeRange(publishedAt: string, timeRange: FeedTimeRange): boolean {
  const pub = new Date(publishedAt).getTime()
  const now = Date.now()
  const ms = timeRange === '24h'
    ? 24 * 60 * 60 * 1000
    : timeRange === '7d'
    ? 7 * 24 * 60 * 60 * 1000
    : 30 * 24 * 60 * 60 * 1000
  return now - pub <= ms
}

type SortBy = 'newest' | 'oldest' | 'urgency' | 'impact'
type FeedViewMode = 'list' | 'grid'
type FeedListView = 'all' | 'unread' | 'pinned'

interface DashboardStateValue {
  // watchlist
  activeWatchlistId: string
  setActiveWatchlistId: (id: string) => void
  watchlistEdits: Record<string, { removed: string[]; added: WatchlistTicker[]; order?: string[] }>
  setWatchlistEdits: React.Dispatch<React.SetStateAction<Record<string, { removed: string[]; added: WatchlistTicker[]; order?: string[] }>>>
  watchlistNameOverrides: Record<string, string>
  setWatchlistNameOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>
  watchlistSettings: Record<string, WatchlistSettings>
  setWatchlistSettings: React.Dispatch<React.SetStateAction<Record<string, WatchlistSettings>>>
  customWatchlists: { id: string; name: string }[]
  setCustomWatchlists: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
  pendingRenameWatchlistId: string | null
  setPendingRenameWatchlistId: (v: string | null) => void
  // signals
  selectedTicker: string | null
  setSelectedTicker: (v: string | null) => void
  selectedSignalId: string | null
  setSelectedSignalId: (v: string | null) => void
  pinnedSignalIds: string[]
  setPinnedSignalIds: React.Dispatch<React.SetStateAction<string[]>>
  readSignalIds: string[]
  setReadSignalIds: React.Dispatch<React.SetStateAction<string[]>>
  // feed UI
  activeFilter: FilterChipId
  setActiveFilter: (v: FilterChipId) => void
  feedFilters: FeedFilters
  setFeedFilters: React.Dispatch<React.SetStateAction<FeedFilters>>
  feedListView: FeedListView
  setFeedListView: (v: FeedListView) => void
  sortBy: SortBy
  setSortBy: (v: SortBy) => void
  feedViewMode: FeedViewMode
  setFeedViewMode: (v: FeedViewMode) => void
  // user settings
  userSettings: UserSettings
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>
  lang: 'en' | 'zh'
  setLang: (l: 'en' | 'zh') => void
  // misc
  lastUpdated: string
  setLastUpdated: (v: string) => void
  ragPrompt: string | null
  setRagPrompt: (v: string | null) => void
  chatContext: ChatContext | null
  setChatContext: (v: ChatContext | null) => void
  chatOpen: boolean
  setChatOpen: (v: boolean) => void
  helpOpen: boolean
  setHelpOpen: (v: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>
  // helpers
  chipToFeedFilters: (id: FilterChipId) => Partial<FeedFilters>
  isWithinTimeRange: (publishedAt: string, timeRange: FeedTimeRange) => boolean
  addWatchlist: () => void
  deleteWatchlist: (id: string) => void
  handleFilterChange: (id: FilterChipId) => void
  handleClearFilters: () => void
  handlePin: (id: string) => void
  handleMarkRead: (id: string) => void
  handleSortByChange: (v: SortBy) => void
  handleFeedViewModeChange: (v: FeedViewMode) => void
  handleRefresh: () => void
  handleAskAI: (query: string, ticker?: string) => void
  handleAskAboutSignal: (id: string, summary?: string) => void
  handleChatClose: () => void
  // derived
  watchlistSummary: ReturnType<typeof computeSummary>
}

function computeSummary(
  activeWatchlistId: string,
  watchlistNameOverrides: Record<string, string>,
  customWatchlists: { id: string; name: string }[],
) {
  const baseWatchlistData = WATCHLIST_BY_ID[activeWatchlistId]
  return baseWatchlistData?.summary ?? {
    name:
      watchlistNameOverrides[activeWatchlistId] ??
      customWatchlists.find((w) => w.id === activeWatchlistId)?.name ??
      'New Watchlist',
    trackedCount: 0,
    signalsToday: 0,
    breakingCount: 0,
    bullishRatio: 0,
    mostActiveAgent: '',
  }
}

const Ctx = createContext<DashboardStateValue | null>(null)

export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(() => {
    try {
      const s = localStorage.getItem('stockclaw_active_watchlist_id')
      return s ?? 'swing'
    } catch {
      return 'swing'
    }
  })
  const setActiveWatchlistIdPersist = (id: string) => {
    setActiveWatchlistId(id)
    try { localStorage.setItem('stockclaw_active_watchlist_id', id) } catch {}
  }

  const [watchlistEdits, setWatchlistEdits] = useState<Record<string, { removed: string[]; added: WatchlistTicker[]; order?: string[] }>>({})
  const [watchlistNameOverrides, setWatchlistNameOverrides] = useState<Record<string, string>>({})
  const [watchlistSettings, setWatchlistSettings] = useState<Record<string, WatchlistSettings>>({})
  const [customWatchlists, setCustomWatchlists] = useState<{ id: string; name: string }[]>([])
  const [pendingRenameWatchlistId, setPendingRenameWatchlistId] = useState<string | null>(null)

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(SIGNALS[0]?.id ?? null)

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

  const [activeFilter, setActiveFilter] = useState<FilterChipId>('all')
  const [feedFilters, setFeedFilters] = useState<FeedFilters>({})
  const [feedListView, setFeedListView] = useState<FeedListView>('all')
  const [sortBy, setSortBy] = useState<SortBy>(() => {
    try {
      const s = localStorage.getItem('stockclaw_feed_preferences')
      const p = s ? JSON.parse(s) : null
      return p?.sortBy === 'oldest' || p?.sortBy === 'urgency' || p?.sortBy === 'impact' ? p.sortBy : 'newest'
    } catch { return 'newest' }
  })
  const [feedViewMode, setFeedViewMode] = useState<FeedViewMode>(() => {
    try {
      const s = localStorage.getItem('stockclaw_feed_preferences')
      const p = s ? JSON.parse(s) : null
      return p?.feedViewMode === 'grid' ? 'grid' : 'list'
    } catch { return 'list' }
  })

  const [userSettings, setUserSettings] = useState<UserSettings>({
    dateFormat: 'relative',
    emailDigest: true,
    push: false,
    breakingOnly: false,
  })
  const [lang, setLang] = useState<'en' | 'zh'>('en')

  const [lastUpdated, setLastUpdated] = useState('8s ago')
  const [ragPrompt, setRagPrompt] = useState<string | null>(null)
  const [chatContext, setChatContext] = useState<ChatContext | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const persistFeedPreferences = (updates: { sortBy?: SortBy; feedViewMode?: FeedViewMode }) => {
    try {
      const s = localStorage.getItem('stockclaw_feed_preferences')
      const p = s ? JSON.parse(s) : {}
      const next = { ...p, ...updates }
      localStorage.setItem('stockclaw_feed_preferences', JSON.stringify(next))
    } catch {}
  }

  const addWatchlist = () => {
    const id = `custom-${Date.now()}`
    setCustomWatchlists((prev) => [...prev, { id, name: 'New Watchlist' }])
    setActiveWatchlistIdPersist(id)
    setPendingRenameWatchlistId(id)
  }

  const deleteWatchlist = (id: string) => {
    setCustomWatchlists((prev) => prev.filter((w) => w.id !== id))
    if (activeWatchlistId === id) setActiveWatchlistIdPersist(MOCK_WATCHLISTS[0]?.id ?? 'swing')
    setWatchlistNameOverrides((prev) => { const n = { ...prev }; delete n[id]; return n })
    setWatchlistSettings((prev) => { const n = { ...prev }; delete n[id]; return n })
    setWatchlistEdits((prev) => { const n = { ...prev }; delete n[id]; return n })
  }

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

  const handleSortByChange = (v: SortBy) => {
    setSortBy(v)
    persistFeedPreferences({ sortBy: v })
  }

  const handleFeedViewModeChange = (v: FeedViewMode) => {
    setFeedViewMode(v)
    persistFeedPreferences({ feedViewMode: v })
  }

  const handleRefresh = () => {
    setLastUpdated('just now')
    setTimeout(() => setLastUpdated('8s ago'), 2500)
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

  const handleChatClose = () => {
    setChatOpen(false)
    setChatContext(null)
  }

  const watchlistSummary = useMemo(
    () => computeSummary(activeWatchlistId, watchlistNameOverrides, customWatchlists),
    [activeWatchlistId, watchlistNameOverrides, customWatchlists],
  )

  const value: DashboardStateValue = {
    activeWatchlistId,
    setActiveWatchlistId: setActiveWatchlistIdPersist,
    watchlistEdits,
    setWatchlistEdits,
    watchlistNameOverrides,
    setWatchlistNameOverrides,
    watchlistSettings,
    setWatchlistSettings,
    customWatchlists,
    setCustomWatchlists,
    pendingRenameWatchlistId,
    setPendingRenameWatchlistId,
    selectedTicker,
    setSelectedTicker,
    selectedSignalId,
    setSelectedSignalId,
    pinnedSignalIds,
    setPinnedSignalIds,
    readSignalIds,
    setReadSignalIds,
    activeFilter,
    setActiveFilter,
    feedFilters,
    setFeedFilters,
    feedListView,
    setFeedListView,
    sortBy,
    setSortBy,
    feedViewMode,
    setFeedViewMode,
    userSettings,
    setUserSettings,
    lang,
    setLang,
    lastUpdated,
    setLastUpdated,
    ragPrompt,
    setRagPrompt,
    chatContext,
    setChatContext,
    chatOpen,
    setChatOpen,
    helpOpen,
    setHelpOpen,
    notificationsOpen,
    setNotificationsOpen,
    chipToFeedFilters,
    isWithinTimeRange,
    addWatchlist,
    deleteWatchlist,
    handleFilterChange,
    handleClearFilters,
    handlePin,
    handleMarkRead,
    handleSortByChange,
    handleFeedViewModeChange,
    handleRefresh,
    handleAskAI,
    handleAskAboutSignal,
    handleChatClose,
    watchlistSummary,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDashboardState(): DashboardStateValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDashboardState must be used inside DashboardStateProvider')
  return v
}

export { DEFAULT_WATCHLIST_SETTINGS }
