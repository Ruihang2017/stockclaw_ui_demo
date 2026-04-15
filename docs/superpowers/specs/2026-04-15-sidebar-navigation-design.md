# Sidebar Navigation Refactor — Design

**Date:** 2026-04-15
**Status:** Approved for planning
**Scope:** UI restructure of the three-column body in `StockClawDashboard` into a single-column layout behind a responsive 4-tab sidebar.

## Summary

Today the app body below the top chrome is three columns: `LeftPanel` (watchlist), `CenterPanel` (signal feed), `RightPanel` (signal detail). This design replaces that body with a collapsible left sidebar (Dashboard, Watchlist, Claw Chat, Settings) plus a single main column that swaps content per active tab. The existing top chrome (Header, StatusStrip, MarketContextStrip, MarketPulseStrip) stays unchanged above the shell.

## Goals

- One primary navigation surface (sidebar) instead of panels competing for horizontal space.
- A single main column so each tab has full width for its content.
- Preserve all existing feature behavior: watchlist management, feed filtering, signal detail (market reaction, reasoning chain, company snapshot, evidence, history), chat, settings.
- Keep it a prototype: no new test infra, no new dependencies beyond what's installed.

## Non-Goals

- Mobile-first polish (bottom tab bar, touch gestures). Sidebar auto-collapses below `md`, but dedicated mobile UX is out of scope.
- New features. This is a structural refactor, not a scope expansion.
- Backend integration. Data stays mock.
- Unit / E2E test introduction. Verification is TypeScript build + manual browser walkthrough.

## Architecture

### Shell

A new `AppShell` layout component owns the top chrome and the sidebar, and renders the active tab into a `<Outlet/>`:

```
<AppShell>
  <Header />
  <StatusStrip />
  <MarketContextStrip />
  <MarketPulseStrip />
  <div flex row>
    <SideNav />
    <main><Outlet /></main>
  </div>
</AppShell>
```

### Routing (App.tsx)

`App.tsx` becomes a layout-route structure:

| Path | Component | Notes |
|---|---|---|
| `/` | `DashboardTab` | Ticker chip strip + filter chips + signal feed with inline detail |
| `/watchlist` | `WatchlistTab` | Watchlist management (picker, summary, ticker table) |
| `/chat` | `ChatTab` | Wraps existing `ChatPage` content, no duplicate chrome |
| `/settings` | `SettingsTab` | Full-page version of current `SettingsModal` content |
| `/stock/:symbol` | `StockDetailPage` | Existing, rendered inside shell |

All five routes render inside `<AppShell>` via a layout route. The existing `BrowserRouter` and `ChatProvider` wrappers stay.

### SideNav

- Two widths: **collapsed 56px** (icon + `title` tooltip) and **expanded 180px** (icon + label), with animated transition.
- Toggle button at bottom (« / »). Collapsed/expanded state persisted in `localStorage` under `stockclaw_sidenav_collapsed`.
- Below Tailwind `md` breakpoint (768px), the sidebar forces collapsed mode and hides the toggle.
- Uses `NavLink` from `react-router-dom` for active state.
- Active tab styling: `bg-charcoal-800` background + `text-blue-400` icon/label (matches existing filter-chip treatment).
- Tab order and icons (lucide-react):
  - Dashboard — `LayoutDashboard` — `/`
  - Watchlist — `Star` — `/watchlist`
  - Claw Chat — `MessageSquare` — `/chat`
  - Settings — `Settings` — `/settings`
- Dashboard icon shows a small blue dot when `watchlistSummary.signalsToday > 0`.

### State ownership

A new `DashboardStateProvider` React context wraps `<AppShell>`. It hoists the cross-tab state currently sitting in `StockClawDashboard`:

- **Watchlist:** `activeWatchlistId`, `watchlistEdits`, `watchlistNameOverrides`, `watchlistSettings`, `customWatchlists`, `pendingRenameWatchlistId`.
- **Signals:** `selectedTicker`, `selectedSignalId`, `pinnedSignalIds`, `readSignalIds`, `expandedSignalId` (new — the single currently-expanded signal card on Dashboard).
- **Feed UI:** `activeFilter`, `feedFilters`, `feedListView`, `sortBy`, `feedViewMode`.
- **User settings:** `userSettings`, `lang`.
- **Misc:** `lastUpdated`, `ragPrompt`, `chatContext`, `chatOpen`, `helpOpen`, `notificationsOpen`.

Chat-specific state remains in the existing `ChatContext` — unchanged.

Rationale for context (vs lifting to router state or adding Zustand): the project already uses a React context (`ChatContext`), so this keeps one pattern. No new dependency.

Persisted keys (localStorage):

- Existing (keep names unchanged): `stockclaw_pinned`, `stockclaw_read`, `stockclaw_feed_preferences`.
- New: `stockclaw_sidenav_collapsed`, `stockclaw_active_watchlist_id`.

## Feature Details

### Dashboard tab (`/`)

Single-column layout containing, top-to-bottom:

1. **Ticker chip strip (new: `TickerChipStrip`).** Horizontally scrollable, no wrap. First chip is "All" (clears ticker filter). Each chip shows symbol + daily %, mirroring the active watchlist's `displayTickers`. Click sets `selectedTicker`; active chip highlighted. Fade edges on overflow.
2. **Feed filter chips (existing).** All / Breaking / Bullish / Bearish / Macro / Earnings / Policy, plus sort (newest/oldest/urgency/impact), list/grid view mode, and list-view selector (all/unread/pinned). All current filter behavior preserved.
3. **Signal feed.** Vertical stack (list) or grid of `SignalCard`s. Pin and mark-read actions preserved.

**Inline signal detail (replaces `RightPanel`).** Clicking a `SignalCard` toggles its `expanded` state; `expandedSignalId` in context ensures only one is expanded at a time. Expanded content renders below the card header as an animated height transition and contains:

- Market Reaction module (reused `MarketReactionModule`).
- Reasoning Chain section.
- Company Snapshot (reused `CompanySnapshot`).
- Evidence and History tabs (extracted from current `RightPanel`).
- "Ask StockClaw about this signal" button — opens existing `ChatSlideOver` with signal context.
- Sticky "collapse" affordance at the bottom of the expanded section.

A new `InlineSignalDetail` component is extracted from `RightPanel`'s body, without the panel chrome, and consumed by `SignalCard` in the expanded state.

### Watchlist tab (`/watchlist`)

Full-column repackaging of current `LeftPanel`:

- Header row: watchlist picker (dropdown) + "+ New watchlist" button. Picker includes a menu for Rename, Delete, Settings.
- Summary strip: tracked count, signals today, breaking count, bullish ratio, most active agent — rendered as a horizontal KPI row.
- Ticker table: symbol, price, % change, signal count, last signal age, remove button. Drag-to-reorder preserved.
- Add-ticker row: search input + add results.
- Row click → navigates to `/stock/:symbol` (existing route). This is the primary drill-in from this tab since the feed lives on Dashboard.

`LeftPanel` is decomposed into reusable sub-components (watchlist picker, summary, ticker table) used by `WatchlistTab`. The ticker-chip subset is used by `TickerChipStrip` on Dashboard.

### Claw Chat tab (`/chat`)

`ChatTab` wraps the existing `ChatPage` content. `ChatPage.tsx` is stripped of any top chrome that duplicates the shell's Header/strips; it becomes the message thread + composer + history sub-pane only. `ChatContext` (existing) continues to provide messages and `sendMessage`.

### Settings tab (`/settings`)

`SettingsTab` lifts the body of the existing `SettingsModal` into a plain full-page form:

- Sections: Language, Date format, Notifications (email digest, push, breaking-only), Default watchlist, Feedback link.
- Same form controls, same state writes (through `DashboardStateProvider`).
- The Settings gear icon in `Header` navigates to `/settings` instead of opening a modal.
- `SettingsModal.tsx` is deleted.

## File Plan

**New**

- `src/layout-a/components/AppShell.tsx`
- `src/layout-a/components/SideNav.tsx`
- `src/layout-a/context/DashboardStateContext.tsx`
- `src/layout-a/components/TickerChipStrip.tsx`
- `src/layout-a/components/InlineSignalDetail.tsx`
- `src/layout-a/pages/DashboardTab.tsx`
- `src/layout-a/pages/WatchlistTab.tsx`
- `src/layout-a/pages/ChatTab.tsx`
- `src/layout-a/pages/SettingsTab.tsx`

**Modified**

- `src/App.tsx` — layout-route restructure with `<AppShell>` + 5 routes.
- `src/layout-a/components/SignalCard.tsx` — `expanded` prop + inline detail render.
- `src/layout-a/components/CenterPanel.tsx` — absorbed into `DashboardTab` (feed rendering + filter chips); file deleted after extraction.
- `src/layout-a/components/Header.tsx` — gear icon navigates to `/settings` instead of opening modal.
- `src/layout-a/components/LeftPanel.tsx` — decomposed into watchlist-picker, summary, ticker-table sub-components.
- `src/layout-a/pages/ChatPage.tsx` — stripped of duplicate top chrome, becomes body consumed by `ChatTab`.
- `src/layout-a/pages/StockDetailPage.tsx` — adjusted to render inside the shell: drop `min-h-screen` and remove its outermost `bg-charcoal-950` wrapper (shell already provides these). Its inner back-link header is kept (context-specific).

**Removed**

- `src/layout-a/components/SettingsModal.tsx` — replaced by `SettingsTab`.
- `src/layout-a/components/RightPanel.tsx` — sole consumer is `StockClawDashboard`; body extracted into `InlineSignalDetail`, file then deleted. (Confirmed `StockDetailPage` does not import `RightPanel`.)
- `src/layout-a/StockClawDashboard.tsx` — logic hoisted into `DashboardStateContext`; file then deleted. `App.tsx` no longer imports it.

## Verification Plan

- **TypeScript gate:** `npm run build` must pass with zero errors.
- **Manual browser walkthrough** (`npm run dev`, Chrome, desktop width):
  1. All four tabs reachable via sidebar; URL updates; browser back/forward traverses tabs.
  2. Sidebar collapse toggle works; preference persists across reload; auto-collapses below `md` breakpoint.
  3. Dashboard ticker chips filter feed; existing filter chips, sort, view-mode, list-view selector, pin, mark-read all still work.
  4. Signal inline expand: click to expand, click to collapse, only one expanded at a time; Market Reaction, Reasoning Chain, Company Snapshot, Evidence, History render; "Ask StockClaw" opens `ChatSlideOver` with correct context.
  5. Watchlist tab: picker, add/rename/delete watchlist, add/remove/reorder tickers, summary KPIs render.
  6. Clicking a ticker on Watchlist tab navigates to `/stock/:symbol`.
  7. Chat tab: history, send, new chat; context persists across tab switches.
  8. Settings tab: language toggle reflects in UI; date format; notifications; default watchlist; Header gear navigates here; modal is gone.
  9. `/stock/:symbol` still works with shell visible around it.
- **Regression watch:** `stockclaw_pinned`, `stockclaw_read`, `stockclaw_feed_preferences` keys must not be renamed.

## Open Questions

None at design-approval time. Surface during planning if decisions emerge that change scope (e.g., whether `StockDetailPage` should render inside or outside the shell — current choice: inside).
