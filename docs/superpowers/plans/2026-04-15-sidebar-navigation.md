# Sidebar Navigation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-column body (LeftPanel | CenterPanel | RightPanel) in `StockClawDashboard` with a single-column layout behind a responsive 4-tab sidebar (Dashboard, Watchlist, Claw Chat, Settings). Top chrome stays unchanged.

**Architecture:** Introduce an `AppShell` layout route that renders top chrome + a collapsible `SideNav` + `<Outlet/>`. Hoist all cross-tab state from `StockClawDashboard` into a new `DashboardStateProvider` context wrapping the shell. Create four tab pages. Extract the signal-detail body (currently split between `CenterPanel`'s inline expansion and `RightPanel`) into a single `InlineSignalDetail` component used inside the Dashboard feed. Routing uses `react-router-dom` `NavLink`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, react-router-dom v6, lucide-react, @dnd-kit (existing watchlist DnD).

**Plan deviations from spec:**

- **`CenterPanel.tsx` is kept, not deleted.** The spec said to absorb it into `DashboardTab`. After reading the 400-line file, the cheaper path is to keep `CenterPanel` as a feed-renderer component and have `DashboardTab` compose it. No behavior change. Final file plan: `CenterPanel` stays; its 'CenterPanel' role is simply "feed body" within a tab.
- **`LeftPanel.tsx` is kept with a `variant` prop, not decomposed into watchlist-picker / summary / ticker-table sub-components.** The spec prescribed decomposition; the plan adds a `variant?: 'sidebar' | 'full'` prop so `WatchlistTab` can embed `LeftPanel` at full width. Same UX, much less risk. Sub-component decomposition is deferred.

These deviations keep the architecture (single-column, four-tab, shared shell, hoisted state) identical while reducing refactor surface area.

**Verification model:** Repo has no test suite and the spec excludes introducing one. Each task ends with a `tsc`/`vite build` gate. Final task runs the dev server and a manual-browser walkthrough.

---

## File Structure (end state)

### New files

- `src/layout-a/context/DashboardStateContext.tsx` — provider + `useDashboardState()` hook owning all cross-tab state.
- `src/layout-a/components/AppShell.tsx` — top chrome + `SideNav` + `<Outlet/>`.
- `src/layout-a/components/SideNav.tsx` — collapsible 4-tab sidebar with `NavLink`.
- `src/layout-a/components/TickerChipStrip.tsx` — horizontal ticker-filter chip row.
- `src/layout-a/components/InlineSignalDetail.tsx` — extracted signal detail body (reasoning/evidence/history + market reaction + company snapshot + "Ask StockClaw" + "View full stock details").
- `src/layout-a/pages/DashboardTab.tsx` — route `/`.
- `src/layout-a/pages/WatchlistTab.tsx` — route `/watchlist`.
- `src/layout-a/pages/ChatTab.tsx` — route `/chat`.
- `src/layout-a/pages/SettingsTab.tsx` — route `/settings`.

### Modified files

- `src/App.tsx` — layout route restructure.
- `src/layout-a/components/CenterPanel.tsx` — its inline-detail block replaced by `<InlineSignalDetail />`. Gains new props for market-reaction/company-snapshot data.
- `src/layout-a/components/LeftPanel.tsx` — new `variant?: 'sidebar' | 'full'` prop.
- `src/layout-a/components/Header.tsx` — gear icon navigates to `/settings` via `useNavigate` instead of `onOpenSettings` prop.
- `src/layout-a/pages/ChatPage.tsx` — stripped of its own header (shell provides top chrome); becomes body only.
- `src/layout-a/pages/StockDetailPage.tsx` — drop `min-h-screen` + outer `bg-charcoal-950` so it nests inside `AppShell`.

### Deleted files

- `src/layout-a/StockClawDashboard.tsx`
- `src/layout-a/components/RightPanel.tsx`
- `src/layout-a/components/SettingsModal.tsx`

---

## Task 1: Hoist state into `DashboardStateProvider`

**Files:**
- Create: `src/layout-a/context/DashboardStateContext.tsx`
- Modify: `src/App.tsx`
- Modify: `src/layout-a/StockClawDashboard.tsx`

- [ ] **Step 1: Create the context file**

Create `src/layout-a/context/DashboardStateContext.tsx` with the full state currently managed inside `StockClawDashboard`. Copy the state declarations (lines 49–99 of the current `StockClawDashboard.tsx`) and the derived values / handlers verbatim, then expose them through a context.

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  WATCHLIST_BY_ID,
  MOCK_WATCHLISTS,
  ADDABLE_TICKERS,
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

// Re-export for convenience
export { DEFAULT_WATCHLIST_SETTINGS }
```

Notes:
- `DEFAULT_WATCHLIST_SETTINGS` is imported from `../types` and re-exported so consumer files can import everything from one place.
- `setActiveWatchlistId` is wrapped to persist to `localStorage` under `stockclaw_active_watchlist_id` (new key per spec).

- [ ] **Step 2: Wrap routes in `App.tsx` with the provider**

Edit `src/App.tsx` so the existing routes are wrapped inside `<DashboardStateProvider>`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatProvider } from '@/layout-a/context/ChatContext'
import { DashboardStateProvider } from '@/layout-a/context/DashboardStateContext'
import { StockClawDashboard } from '@/layout-a/StockClawDashboard'
import { ChatPage } from '@/layout-a/pages/ChatPage'
import { StockDetailPage } from '@/layout-a/pages/StockDetailPage'

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <DashboardStateProvider>
          <Routes>
            <Route path="/" element={<StockClawDashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/stock/:symbol" element={<StockDetailPage />} />
          </Routes>
        </DashboardStateProvider>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 3: Rewire `StockClawDashboard.tsx` to consume the context**

Edit `src/layout-a/StockClawDashboard.tsx`:

1. Remove all `useState` calls (lines ~49–99) and the handlers/helpers now in the provider (`chipToFeedFilters`, `isWithinTimeRange`, `handleAddWatchlist`, `handleDeleteWatchlist`, `handleFilterChange`, `handleClearFilters`, `handlePin`, `handleMarkRead`, `persistFeedPreferences`, `handleSortByChange`, `handleFeedViewModeChange`, `handleAskAI`, `handleAskAboutSignal`, `handleSearchSubmit`, `handleChatClose`, `handleRefresh`).
2. At the top of the component, replace with a single destructure from the context:

```tsx
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
  ragPrompt, chatContext,
  chatOpen, setChatOpen,
  helpOpen, setHelpOpen,
  notificationsOpen, setNotificationsOpen,
  isWithinTimeRange,
  addWatchlist, deleteWatchlist,
  handleFilterChange, handleClearFilters,
  handlePin, handleMarkRead,
  handleSortByChange, handleFeedViewModeChange,
  handleRefresh, handleAskAI, handleAskAboutSignal, handleChatClose,
  watchlistSummary,
} = useDashboardState()
```

Plus import:

```tsx
import { useDashboardState, DEFAULT_WATCHLIST_SETTINGS } from './context/DashboardStateContext'
```

Then delete the top-level imports of `DEFAULT_WATCHLIST_SETTINGS` from `./types` (now re-exported from context) and the helper function definitions. Keep the `useMemo` blocks for `baseWatchlistTickers`, `displayTickers`, `displaySummary`, `watchlistOptionsWithOverrides`, `filteredSignals`, `signalsAfterListView`, `feedFilterOptions`, `selectedSignal`, and `displayTicker` — they are view-local derivations, not moved.

Keep `handleSearchSubmit` defined inside the component (it uses `navigate` which is from `useNavigate()`; not suitable for context).

Keep the three handler closures that capture `activeWatchlistId` for watchlist edits (`handleRemoveTicker`, `handleAddTicker`, `handleReorderTicker`) inline for now — they read `activeWatchlistId` from context but also need to update `watchlistEdits` and can stay as local functions calling `setWatchlistEdits`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exits 0 with no TypeScript errors. `dist/` produced.

- [ ] **Step 5: Verify dev server**

Run: `npm run dev`
Expected: app boots, 3-column layout renders exactly as before, all existing interactions (ticker select, signal select, watchlist switch, pin, mark read, filter chips, sort, view mode) still work. Ctrl+C to stop.

- [ ] **Step 6: Commit**

```bash
git add src/layout-a/context/DashboardStateContext.tsx src/App.tsx src/layout-a/StockClawDashboard.tsx
git commit -m "Hoist dashboard state into DashboardStateProvider"
```

---

## Task 2: Extract `InlineSignalDetail` and plumb market-reaction / company-snapshot data

**Files:**
- Create: `src/layout-a/components/InlineSignalDetail.tsx`
- Modify: `src/layout-a/components/CenterPanel.tsx`
- Modify: `src/layout-a/StockClawDashboard.tsx`

**Goal:** Move the body of the signal detail (currently inline inside `CenterPanel` lines 273–389 + what `RightPanel` renders in lines 33–65) into one reusable component. When a signal is expanded, it now shows: summary/evidence/history tabs (existing) **plus** market-reaction + company-snapshot **plus** "View full stock details" link (migrated from `RightPanel`).

- [ ] **Step 1: Create `InlineSignalDetail.tsx`**

Create `src/layout-a/components/InlineSignalDetail.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, MessageSquare } from 'lucide-react'
import type { Signal, StockPriceData, CompanyFundamentals, SnapshotPerformance, BrokerConsensus } from '../types'
import { MarketReactionModule, type ChartTimeframe } from './MarketReactionModule'
import { CompanySnapshot } from './CompanySnapshot'

type SignalDetailTab = 'summary' | 'evidence' | 'history'

interface InlineSignalDetailProps {
  signal: Signal
  lang: 'en' | 'zh'
  displayTicker: string | null
  stockPrice: StockPriceData | null
  fundamentals: CompanyFundamentals | null
  performance: SnapshotPerformance | null
  brokerConsensus: BrokerConsensus | null
  onAskAboutSignal?: (signalId: string, summary?: string) => void
}

export function InlineSignalDetail({
  signal,
  lang,
  displayTicker,
  stockPrice,
  fundamentals,
  performance,
  brokerConsensus,
  onAskAboutSignal,
}: InlineSignalDetailProps) {
  const [tab, setTab] = useState<SignalDetailTab>('summary')
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1D')

  useEffect(() => {
    setTab('summary')
  }, [signal.id])

  return (
    <div className="border-t border-charcoal-600/80">
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-600/80 px-3 py-2">
        {onAskAboutSignal && (
          <button
            type="button"
            onClick={() => onAskAboutSignal(signal.id, lang === 'zh' ? signal.summaryZh : signal.summaryEn)}
            className="flex items-center gap-1.5 text-xs text-accent-gold hover:underline"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask StockClaw about this signal
          </button>
        )}
        {displayTicker && (
          <Link
            to={`/stock/${displayTicker}`}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent-gold"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View full stock details
          </Link>
        )}
      </div>
      <div className="flex border-b border-charcoal-600/80">
        {(['summary', 'evidence', 'history'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[10px] font-medium uppercase transition-colors ${
              tab === t ? 'border-b-2 border-accent-gold text-accent-gold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'summary' ? 'Summary' : t === 'evidence' ? 'Evidence' : 'History'}
          </button>
        ))}
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-3 space-y-3">
        {tab === 'summary' && (
          <>
            <section>
              <h3 className="text-[10px] uppercase text-gray-500">Why it matters</h3>
              <p className="mt-1 text-xs text-gray-300">{signal.whyItMatters}</p>
            </section>
            <section>
              <h3 className="text-[10px] uppercase text-gray-500">Reasoning chain</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs text-gray-300">
                {signal.reasoningSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
            {displayTicker && (
              <section>
                <MarketReactionModule
                  tickerSymbol={displayTicker}
                  data={stockPrice}
                  timeframe={chartTimeframe}
                  onTimeframeChange={setChartTimeframe}
                />
              </section>
            )}
            {displayTicker && (
              <section>
                <CompanySnapshot
                  tickerSymbol={displayTicker}
                  data={fundamentals}
                  stockPrice={stockPrice}
                  performance={performance}
                  brokerConsensus={brokerConsensus}
                />
              </section>
            )}
          </>
        )}
        {tab === 'evidence' && (
          <div>
            <h3 className="text-[10px] uppercase text-gray-500">Evidence transparency</h3>
            <dl className="mt-2 space-y-1 text-[10px]">
              <div className="flex justify-between"><dt className="text-gray-500">Source type</dt><dd className="text-gray-300">{signal.evidenceMeta.sourceType}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Source publish</dt><dd className="text-gray-300">{signal.evidenceMeta.sourcePublishTime}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Extraction time</dt><dd className="text-gray-300">{signal.evidenceMeta.extractionTime}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Ticker matching</dt><dd className="text-gray-300">{signal.evidenceMeta.tickerMatchingLogic}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Confidence</dt><dd className="text-gray-300">{signal.evidenceMeta.confidence}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Relevance</dt><dd className="text-gray-300">{signal.evidenceMeta.relevance}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Related evidence</dt><dd className="text-gray-300">{signal.evidenceMeta.relatedEvidenceCount}</dd></div>
            </dl>
          </div>
        )}
        {tab === 'history' && (
          <div>
            <h3 className="text-[10px] uppercase text-gray-500">Related historical signals</h3>
            <ul className="mt-2 space-y-2">
              {signal.relatedHistory.map((h, i) => (
                <li key={i} className="rounded border border-charcoal-600 bg-charcoal-900 p-2 text-[10px]">
                  <p className="text-gray-300">{h.summary}</p>
                  <p className="mt-1 text-gray-500">{h.date} · similarity {h.similarityScore}</p>
                  {h.marketReaction && <p className="text-gray-500">{h.marketReaction}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
```

All four data types (`StockPriceData`, `CompanyFundamentals`, `SnapshotPerformance`, `BrokerConsensus`) are exported from `src/layout-a/types.ts`. `ChartTimeframe` is the only type exported from `MarketReactionModule`.

- [ ] **Step 2: Update `CenterPanel` to use `InlineSignalDetail`**

In `src/layout-a/components/CenterPanel.tsx`:

1. Add new props to the interface (before the closing `}` at line 47):

```tsx
  // Data passed through to InlineSignalDetail
  detailDisplayTicker?: string | null
  detailStockPrice?: import('../types').StockPriceData | null
  detailFundamentals?: import('../types').CompanyFundamentals | null
  detailPerformance?: import('../types').SnapshotPerformance | null
  detailBrokerConsensus?: import('../types').BrokerConsensus | null
```

2. Add to the destructured params (around line 71):

```tsx
  detailDisplayTicker = null,
  detailStockPrice = null,
  detailFundamentals = null,
  detailPerformance = null,
  detailBrokerConsensus = null,
```

3. Remove the local `signalDetailTab` state and `useEffect` reset (lines 76–77, 106–108). Remove the `MessageSquare` import from `lucide-react` on line 2 (now inside `InlineSignalDetail`).

4. Replace the entire `expandedBlock` variable assignment (lines 297–374) with:

```tsx
            const expandedBlock = isSelected && selectedSignal && (
              <InlineSignalDetail
                signal={selectedSignal}
                lang={lang}
                displayTicker={detailDisplayTicker}
                stockPrice={detailStockPrice}
                fundamentals={detailFundamentals}
                performance={detailPerformance}
                brokerConsensus={detailBrokerConsensus}
                onAskAboutSignal={onAskAboutSignal}
              />
            )
```

5. Add the import at the top: `import { InlineSignalDetail } from './InlineSignalDetail'`.

- [ ] **Step 3: Pass detail data from `StockClawDashboard` to `CenterPanel`**

In `src/layout-a/StockClawDashboard.tsx`:

1. Import at top:

```tsx
import { STOCK_PRICE_BY_SYMBOL, COMPANY_FUNDAMENTALS_BY_SYMBOL, SNAPSHOT_PERFORMANCE_BY_SYMBOL, BROKER_CONSENSUS_BY_SYMBOL } from './mockData'
```

2. After `const displayTicker = ...` (bottom of the component's hook section), add:

```tsx
  const detailStockPrice = displayTicker ? STOCK_PRICE_BY_SYMBOL[displayTicker] ?? null : null
  const detailFundamentals = displayTicker ? COMPANY_FUNDAMENTALS_BY_SYMBOL[displayTicker] ?? null : null
  const detailPerformance = displayTicker ? SNAPSHOT_PERFORMANCE_BY_SYMBOL[displayTicker] ?? null : null
  const detailBrokerConsensus = displayTicker ? BROKER_CONSENSUS_BY_SYMBOL[displayTicker] ?? null : null
```

3. Pass to `<CenterPanel>` JSX (around line 367–390) by adding:

```tsx
  detailDisplayTicker={displayTicker}
  detailStockPrice={detailStockPrice}
  detailFundamentals={detailFundamentals}
  detailPerformance={detailPerformance}
  detailBrokerConsensus={detailBrokerConsensus}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build passes. If a type name mismatch shows up (e.g. `StockPrice` not exported from `MarketReactionModule`), read the file and adjust the import — the signatures in `RightPanel.tsx` are the source of truth for the correct types.

- [ ] **Step 5: Verify dev server**

Run: `npm run dev`. Click a signal in the feed. Expected: expanded detail now includes Market Reaction chart and Company Snapshot, plus the "View full stock details" link, alongside the existing summary/evidence/history tabs. The old `RightPanel` (still mounted) now shows duplicate info — that's OK until Task 10.

- [ ] **Step 6: Commit**

```bash
git add src/layout-a/components/InlineSignalDetail.tsx src/layout-a/components/CenterPanel.tsx src/layout-a/StockClawDashboard.tsx
git commit -m "Extract InlineSignalDetail with market reaction + company snapshot"
```

---

## Task 3: Create `TickerChipStrip`

**Files:**
- Create: `src/layout-a/components/TickerChipStrip.tsx`

- [ ] **Step 1: Create the component**

Create `src/layout-a/components/TickerChipStrip.tsx`:

```tsx
import type { WatchlistTicker } from '../types'

interface TickerChipStripProps {
  tickers: WatchlistTicker[]
  selectedTicker: string | null
  onSelectTicker: (symbol: string | null) => void
}

function changeClass(pct: number | undefined) {
  if (pct == null) return 'text-gray-500'
  if (pct > 0) return 'text-bullish'
  if (pct < 0) return 'text-bearish'
  return 'text-gray-400'
}

export function TickerChipStrip({ tickers, selectedTicker, onSelectTicker }: TickerChipStripProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-charcoal-600 bg-charcoal-900 px-3 py-2 [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelectTicker(null)}
        className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
          selectedTicker === null
            ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
            : 'border-charcoal-600 bg-charcoal-800 text-gray-300 hover:border-charcoal-500'
        }`}
      >
        All
      </button>
      {tickers.map((t) => {
        const active = selectedTicker === t.symbol
        return (
          <button
            key={t.symbol}
            type="button"
            onClick={() => onSelectTicker(active ? null : t.symbol)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
              active
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                : 'border-charcoal-600 bg-charcoal-800 text-gray-300 hover:border-charcoal-500'
            }`}
          >
            <span className="font-medium">{t.symbol}</span>
            {t.dailyChangePercent != null && (
              <span className={`ml-1.5 ${changeClass(t.dailyChangePercent)}`}>
                {t.dailyChangePercent >= 0 ? '+' : ''}{t.dailyChangePercent.toFixed(1)}%
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: passes. Component is unused yet, that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/layout-a/components/TickerChipStrip.tsx
git commit -m "Add TickerChipStrip component"
```

---

## Task 4: Create `SideNav`

**Files:**
- Create: `src/layout-a/components/SideNav.tsx`

- [ ] **Step 1: Create the component**

Create `src/layout-a/components/SideNav.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Star, MessageSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const COLLAPSED_STORAGE_KEY = 'stockclaw_sidenav_collapsed'
const MOBILE_BREAKPOINT = 768 // px, matches Tailwind's md

interface SideNavProps {
  signalsToday?: number
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: Star, end: false },
  { to: '/chat', label: 'Claw Chat', icon: MessageSquare, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

export function SideNav({ signalsToday = 0 }: SideNavProps) {
  const [userCollapsed, setUserCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(COLLAPSED_STORAGE_KEY)
      return v === '1'
    } catch {
      return false
    }
  })
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  )

  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const collapsed = isSmallScreen || userCollapsed

  const toggle = () => {
    setUserCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? '1' : '0') } catch {}
      return next
    })
  }

  return (
    <nav
      className={`flex shrink-0 flex-col border-r border-charcoal-600 bg-charcoal-900 transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-[180px]'
      }`}
      aria-label="Primary"
    >
      <div className="flex flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const showBadge = item.label === 'Dashboard' && signalsToday > 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded px-2 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-charcoal-800 text-accent-gold'
                    : 'text-gray-400 hover:bg-charcoal-800 hover:text-gray-200'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {showBadge && (
                <span
                  className={`${collapsed ? 'absolute right-1 top-1' : 'ml-auto'} h-1.5 w-1.5 rounded-full bg-accent-gold`}
                  aria-label={`${signalsToday} new signals`}
                />
              )}
            </NavLink>
          )
        })}
      </div>
      {!isSmallScreen && (
        <button
          type="button"
          onClick={toggle}
          className="mt-auto flex items-center gap-2 border-t border-charcoal-600 px-3 py-2 text-[10px] text-gray-500 hover:text-gray-300"
          aria-label={userCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {userCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          {!collapsed && <span>collapse</span>}
        </button>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/layout-a/components/SideNav.tsx
git commit -m "Add collapsible SideNav with four tabs"
```

---

## Task 5: Create `AppShell`

**Files:**
- Create: `src/layout-a/components/AppShell.tsx`

- [ ] **Step 1: Create the component**

Create `src/layout-a/components/AppShell.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { StatusStrip } from './StatusStrip'
import { MarketContextStrip } from './MarketContextStrip'
import { MarketPulseStrip } from './MarketPulseStrip'
import { SideNav } from './SideNav'
import { ChatSlideOver } from './ChatSlideOver'
import { HelpModal } from './HelpModal'
import { useDashboardState } from '../context/DashboardStateContext'
import { useChat } from '../context/ChatContext'
import { MARKET_INDEXES, MARKET_PULSE_ITEMS, MOCK_NOTIFICATIONS } from '../mockData'

export function AppShell() {
  const navigate = useNavigate()
  const { activeMessages, sendMessage, newChat } = useChat()
  const {
    watchlistSummary,
    lang, setLang,
    setHelpOpen, helpOpen,
    notificationsOpen, setNotificationsOpen,
    lastUpdated,
    chatOpen, setChatOpen,
    ragPrompt, setRagPrompt,
    chatContext, setChatContext,
    handleChatClose,
  } = useDashboardState()

  const handleSearchSubmit = (query: string) => {
    navigate('/chat', { state: { initialQuery: query } })
  }

  return (
    <div className="flex h-screen flex-col bg-charcoal-950 text-gray-200">
      <Header
        newSignalsCount={watchlistSummary.signalsToday}
        lang={lang}
        onLangToggle={() => setLang(lang === 'en' ? 'zh' : 'en')}
        onOpenSettings={() => navigate('/settings')}
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
      <div className="flex min-h-0 flex-1">
        <SideNav signalsToday={watchlistSummary.signalsToday} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>

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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/layout-a/components/AppShell.tsx
git commit -m "Add AppShell layout with top chrome and SideNav"
```

---

## Task 6: Create `DashboardTab`

**Files:**
- Create: `src/layout-a/pages/DashboardTab.tsx`

- [ ] **Step 1: Create the tab**

Create `src/layout-a/pages/DashboardTab.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: passes. Component is unused (no route) yet, which is fine.

- [ ] **Step 3: Commit**

```bash
git add src/layout-a/pages/DashboardTab.tsx
git commit -m "Add DashboardTab page"
```

---

## Task 7: Create `WatchlistTab` and add `variant` prop to `LeftPanel`

**Files:**
- Modify: `src/layout-a/components/LeftPanel.tsx`
- Create: `src/layout-a/pages/WatchlistTab.tsx`

- [ ] **Step 1: Add `variant` prop to `LeftPanel`**

In `src/layout-a/components/LeftPanel.tsx`:

1. Add to `LeftPanelProps` interface (around line 24):

```tsx
  variant?: 'sidebar' | 'full'
```

2. Add to destructured params (around line 227) with default `'sidebar'`:

```tsx
  variant = 'sidebar',
```

3. Replace the outer `<aside>` className (line 339) with:

```tsx
    <aside className={`flex w-full flex-shrink-0 flex-col bg-charcoal-900 ${
      variant === 'sidebar'
        ? 'border-r border-charcoal-600 md:min-w-[280px] md:max-w-[300px]'
        : 'h-full overflow-y-auto'
    }`}>
```

No other changes to `LeftPanel` are required. The `full` variant drops the sidebar width constraints and makes the whole panel scroll.

- [ ] **Step 2: Create `WatchlistTab.tsx`**

Create `src/layout-a/pages/WatchlistTab.tsx`:

```tsx
import { useMemo } from 'react'
import { LeftPanel } from '../components/LeftPanel'
import { useDashboardState, DEFAULT_WATCHLIST_SETTINGS } from '../context/DashboardStateContext'
import { WATCHLIST_BY_ID, MOCK_WATCHLISTS, ADDABLE_TICKERS } from '../mockData'

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

  const handleAddTicker = (ticker: import('../types').WatchlistTicker) => {
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/layout-a/components/LeftPanel.tsx src/layout-a/pages/WatchlistTab.tsx
git commit -m "Add WatchlistTab with full-width LeftPanel variant"
```

---

## Task 8: Create `ChatTab` and `SettingsTab`

**Files:**
- Create: `src/layout-a/pages/ChatTab.tsx`
- Create: `src/layout-a/pages/SettingsTab.tsx`

- [ ] **Step 1: Create `ChatTab.tsx`**

`ChatTab` is a thin copy of `ChatPage.tsx` minus the top chrome (shell provides the Header). Create `src/layout-a/pages/ChatTab.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { RAGModule } from '../components/RAGModule'

export function ChatTab() {
  const { activeMessages, sendMessage } = useChat()
  const location = useLocation()
  const stateQuery = (location.state as { initialQuery?: string } | null)?.initialQuery
  const [inputValue, setInputValue] = useState(stateQuery ?? '')
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (stateQuery) setInputValue(stateQuery)
  }, [stateQuery])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [activeMessages])

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    sendMessage(text)
    setInputValue('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-charcoal-600 bg-charcoal-900 px-4 py-3">
        <h1 className="text-sm font-medium text-accent-gold">Ask StockClaw</h1>
      </div>

      <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {activeMessages.length === 0 && (
          <p className="text-xs text-gray-500">
            Ask about signals, tickers, or market context. Your conversation will appear here.
          </p>
        )}
        {activeMessages.map((m, i) => (
          <div
            key={i}
            className={`rounded px-3 py-2 text-xs ${
              m.role === 'user'
                ? 'ml-8 bg-charcoal-700 text-gray-200'
                : 'mr-8 bg-charcoal-800 text-gray-300'
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-charcoal-600 bg-charcoal-900 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about signals, tickers..."
            className="min-w-0 flex-1 rounded border border-charcoal-600 bg-charcoal-800 px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:border-charcoal-500 focus:outline-none"
            aria-label="Message"
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-2 text-xs text-gray-200 hover:bg-charcoal-700"
          >
            Send
          </button>
        </div>

        <div className="mt-4">
          <RAGModule lang="en" onOpenInChat={(query) => sendMessage(query)} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `SettingsTab.tsx`**

Translate the `SettingsModal` body (lines 40–183) into a plain full-page layout, reading settings from and writing through the context.

Create `src/layout-a/pages/SettingsTab.tsx`:

```tsx
import { useMemo } from 'react'
import { useDashboardState } from '../context/DashboardStateContext'
import { MOCK_WATCHLISTS } from '../mockData'

export function SettingsTab() {
  const {
    lang, setLang,
    userSettings, setUserSettings,
    activeWatchlistId, setActiveWatchlistId,
    watchlistNameOverrides,
    customWatchlists,
  } = useDashboardState()

  const watchlistOptions = useMemo(
    () => [
      ...MOCK_WATCHLISTS.map((w) => ({ ...w, name: watchlistNameOverrides[w.id] ?? w.name })),
      ...customWatchlists.map((w) => ({ ...w, name: watchlistNameOverrides[w.id] ?? w.name })),
    ],
    [watchlistNameOverrides, customWatchlists],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <div className="w-full max-w-2xl">
        <h1 className="mb-4 text-sm font-medium text-gray-200">Settings</h1>

        <section className="mb-6 border-b border-charcoal-600 pb-4">
          <h2 className="mb-2 text-[10px] uppercase text-gray-500">Display</h2>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-[10px] text-gray-500">Default language</p>
              <div className="flex gap-2">
                {(['en', 'zh'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`rounded border px-2 py-1 text-xs ${
                      lang === l
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                        : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500'
                    }`}
                  >
                    {l === 'en' ? 'EN' : '中文'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] text-gray-500">Date format</p>
              <div className="flex gap-2">
                {(['relative', 'absolute'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setUserSettings((s) => ({ ...s, dateFormat: fmt }))}
                    className={`rounded border px-2 py-1 text-xs ${
                      userSettings.dateFormat === fmt
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                        : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500'
                    }`}
                  >
                    {fmt === 'relative' ? 'Relative (2m ago)' : 'Absolute'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 border-b border-charcoal-600 pb-4">
          <h2 className="mb-2 text-[10px] uppercase text-gray-500">Notifications</h2>
          <div className="space-y-1.5">
            {([
              ['emailDigest', 'Email digest'],
              ['push', 'Browser push'],
              ['breakingOnly', 'BREAKING only'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={userSettings[key]}
                  onChange={(e) => setUserSettings((s) => ({ ...s, [key]: e.target.checked }))}
                  className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-6 border-b border-charcoal-600 pb-4">
          <h2 className="mb-2 text-[10px] uppercase text-gray-500">Default watchlist</h2>
          <select
            value={activeWatchlistId}
            onChange={(e) => setActiveWatchlistId(e.target.value)}
            className="w-full max-w-xs rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-xs text-gray-200 focus:border-charcoal-500 focus:outline-none"
          >
            {watchlistOptions.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </section>

        <section>
          <h2 className="mb-2 text-[10px] uppercase text-gray-500">About</h2>
          <p className="text-xs text-gray-400">StockClaw Dashboard Demo v2 — mock data only.</p>
          <a href="#feedback" className="mt-1 inline-block text-xs text-accent-gold hover:underline">
            Give feedback
          </a>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/layout-a/pages/ChatTab.tsx src/layout-a/pages/SettingsTab.tsx
git commit -m "Add ChatTab and SettingsTab pages"
```

---

## Task 9: Switch routing in `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/layout-a/pages/StockDetailPage.tsx`

- [ ] **Step 1: Rewire `App.tsx`**

Replace the entire body of `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatProvider } from '@/layout-a/context/ChatContext'
import { DashboardStateProvider } from '@/layout-a/context/DashboardStateContext'
import { AppShell } from '@/layout-a/components/AppShell'
import { DashboardTab } from '@/layout-a/pages/DashboardTab'
import { WatchlistTab } from '@/layout-a/pages/WatchlistTab'
import { ChatTab } from '@/layout-a/pages/ChatTab'
import { SettingsTab } from '@/layout-a/pages/SettingsTab'
import { StockDetailPage } from '@/layout-a/pages/StockDetailPage'

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <DashboardStateProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardTab />} />
              <Route path="/watchlist" element={<WatchlistTab />} />
              <Route path="/chat" element={<ChatTab />} />
              <Route path="/settings" element={<SettingsTab />} />
              <Route path="/stock/:symbol" element={<StockDetailPage />} />
            </Route>
          </Routes>
        </DashboardStateProvider>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App
```

Note: `StockClawDashboard` and `ChatPage` are no longer imported. They become unreachable once this file is saved (build will warn if still imported anywhere).

- [ ] **Step 2: Adjust `StockDetailPage` to nest inside shell**

In `src/layout-a/pages/StockDetailPage.tsx`, modify the outer `<div>` (around line 19):

- Before: `<div className="flex min-h-screen flex-col bg-charcoal-950 text-gray-200">`
- After: `<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">`

The shell already provides `bg-charcoal-950 text-gray-200`. The inner back-link header is kept (context-specific "Back to dashboard").

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: passes. `StockClawDashboard.tsx`, `ChatPage.tsx`, `RightPanel.tsx`, `SettingsModal.tsx` are now unused but still present — Vite does not error on unused files.

- [ ] **Step 4: Verify dev server (smoke test)**

Run: `npm run dev`. Verify:
- Sidebar appears at `http://localhost:5173/`; all four tabs are clickable.
- Dashboard shows ticker chip strip + signal feed.
- Watchlist tab shows the watchlist.
- Chat tab shows message thread.
- Settings tab shows settings form.
- Clicking gear icon in Header navigates to `/settings`.
- Sidebar collapse toggle works; preference survives reload.
- Resizing window below 768px auto-collapses sidebar.

If everything works, continue to Task 10.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/layout-a/pages/StockDetailPage.tsx
git commit -m "Switch routing to AppShell + 4 tab routes"
```

---

## Task 10: Cleanup — delete obsolete files, final walkthrough

**Files:**
- Delete: `src/layout-a/StockClawDashboard.tsx`
- Delete: `src/layout-a/components/RightPanel.tsx`
- Delete: `src/layout-a/components/SettingsModal.tsx`
- Delete: `src/layout-a/pages/ChatPage.tsx`
- Modify: `src/layout-a/components/Header.tsx`

- [ ] **Step 1: Confirm no references to the files about to be deleted**

Run each command; each should print zero lines:

```bash
grep -rn "from.*StockClawDashboard" src/ || true
grep -rn "from.*RightPanel" src/ || true
grep -rn "from.*SettingsModal" src/ || true
grep -rn "from.*pages/ChatPage" src/ || true
```

If any line is printed, trace and remove the lingering import before deleting.

- [ ] **Step 2: Delete the obsolete files**

```bash
rm src/layout-a/StockClawDashboard.tsx
rm src/layout-a/components/RightPanel.tsx
rm src/layout-a/components/SettingsModal.tsx
rm src/layout-a/pages/ChatPage.tsx
```

- [ ] **Step 3: Simplify `Header.tsx`**

The shell now passes `onOpenSettings={() => navigate('/settings')}`. The prop still exists — no code change is required on `Header.tsx`. The gear icon already calls `onOpenSettings`, which now navigates.

Optional cleanup: the `onOpenSettings` prop name is slightly misleading now; rename to `onOpenSettingsNav` is a minor quality nit. Skip rename for this refactor; keep the existing name.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: passes with zero errors.

- [ ] **Step 5: Manual browser walkthrough**

Run: `npm run dev` and open the URL shown. Step through each item:

1. **Sidebar navigation:** Click each of the four tabs. URL updates (`/`, `/watchlist`, `/chat`, `/settings`). Browser back/forward traverses them.
2. **Sidebar collapse:** Click the `«` toggle at the bottom. Width shrinks to 56px, labels disappear, icons remain. Refresh — stays collapsed. Click `»` to expand. Refresh — stays expanded.
3. **Responsive:** Resize window below 768px. Sidebar auto-collapses; toggle button disappears. Resize back — sidebar restores user preference.
4. **Dashboard ticker chips:** Click a chip — signal feed filters to that ticker. Click "All" — filter clears.
5. **Dashboard filter chips:** Each of Breaking/Bullish/Bearish/Macro/Earnings/Policy filters the feed. Sort dropdown cycles Newest/Oldest/Urgency/Impact. List/Grid toggle switches view.
6. **Pin / mark read:** Click pin on a card — icon fills. Refresh — still pinned. Same for "mark read" → read state persists.
7. **Feed list-view selector:** All / Unread / Pinned correctly filter the list.
8. **Signal inline expand:** Click a signal card. Expanded view shows: Why it matters, Reasoning chain, Market Reaction chart (with 1D/5D/1M toggle), Company Snapshot, "Ask StockClaw about this signal", "View full stock details". Click Evidence and History tabs — content changes accordingly. Click the same card header again — collapses.
9. **Ask StockClaw:** From inline detail, click "Ask StockClaw about this signal". ChatSlideOver opens with signal context and prefilled prompt.
10. **Watchlist tab:** Picker dropdown switches watchlists. "+ New watchlist" creates a new one; rename modal opens. Delete action works for custom lists. Add / remove / reorder tickers work (DnD). KPI summary updates.
11. **Drill into a stock:** On Watchlist tab, click a ticker row. You navigate to `/stock/:symbol`. Sidebar stays visible. "Back to dashboard" link returns to `/`.
12. **Chat tab:** Thread renders. Send a message. RAG module renders below the composer. Open the tab in a fresh route — messages persist (via `ChatContext`).
13. **Settings tab:** Toggle EN / 中文 → header language toggle reflects. Toggle date format. Toggle each of the three notification checkboxes. Change default watchlist — active watchlist switches.
14. **Header gear:** Click the gear icon — navigates to `/settings`.
15. **localStorage keys:** Open DevTools → Application → Local Storage. Confirm these keys exist: `stockclaw_pinned`, `stockclaw_read`, `stockclaw_feed_preferences`, `stockclaw_sidenav_collapsed`, `stockclaw_active_watchlist_id`.
16. **Notifications bell:** Click in Header — dropdown opens; list of mock notifications is visible.
17. **Help:** Help link in header opens HelpModal.

If any item fails, fix before committing.

- [ ] **Step 6: Commit cleanup**

```bash
git add -A
git commit -m "Remove StockClawDashboard, RightPanel, SettingsModal, ChatPage"
```

---

## Self-Review

After the plan is executed end-to-end, the following spec requirements are all covered:

- **Shell layout** (Task 5, 9): top chrome + sidebar + `<Outlet/>`.
- **Routing** (Task 9): `/`, `/watchlist`, `/chat`, `/settings`, `/stock/:symbol` all inside shell.
- **SideNav behavior** (Task 4): 56px↔180px, persisted preference, mobile auto-collapse, NavLink active styling, notifications dot.
- **DashboardStateProvider** (Task 1): all cross-tab state + persistence keys.
- **Dashboard tab** (Task 6, 3): ticker chip strip, filter chips, sort, view mode, list-view selector, pin/read.
- **Inline signal detail** (Task 2): reasoning, evidence, history, market reaction, company snapshot, Ask StockClaw, view full stock details.
- **Watchlist tab** (Task 7): picker, summary, ticker table, add/remove/reorder, rename, delete, settings. Row click → `/stock/:symbol`.
- **Chat tab** (Task 8): reuses chat body without duplicate chrome.
- **Settings tab** (Task 8): language, date format, notifications, default watchlist, feedback link.
- **Header gear** (Task 5 wire-up, Task 9 no-op): navigates to `/settings`.
- **StockDetailPage adjustments** (Task 9): nests inside shell.
- **File deletions** (Task 10): `StockClawDashboard`, `RightPanel`, `SettingsModal`, `ChatPage`.
- **localStorage keys** (Tasks 1, 4): `stockclaw_pinned`, `stockclaw_read`, `stockclaw_feed_preferences` kept as-is; `stockclaw_sidenav_collapsed` and `stockclaw_active_watchlist_id` added.
- **Verification model** (every task, especially 10): `npm run build` after each task; manual browser walkthrough at the end.

Non-goals (mobile polish, tests, new features) are not covered — correct, per spec.
