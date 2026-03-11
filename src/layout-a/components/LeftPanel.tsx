import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Settings, Plus, MessageSquare, Radio, MoreHorizontal, GripVertical, Trash2 } from 'lucide-react'
import type { WatchlistTicker, WatchlistSummary, WatchlistOption } from '../types'
import type { FilterChipId } from '../types'

interface LeftPanelProps {
  summary: WatchlistSummary
  tickers: WatchlistTicker[]
  selectedTicker: string | null
  onSelectTicker: (symbol: string) => void
  activeFilter: FilterChipId
  onFilterChange: (id: FilterChipId) => void
  onRemoveTicker?: (symbol: string) => void
  addableTickers?: WatchlistTicker[]
  onAddTicker?: (ticker: WatchlistTicker) => void
  watchlistOptions?: WatchlistOption[]
  activeWatchlistId?: string
  onWatchlistSelect?: (id: string) => void
  onReorderTicker?: (newOrder: string[]) => void
  onAskAI?: (query: string) => void
}

const FILTER_CHIPS: { id: FilterChipId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'breaking', label: 'Breaking' },
  { id: 'bullish', label: 'Bullish' },
  { id: 'bearish', label: 'Bearish' },
  { id: 'macro', label: 'Macro' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'policy', label: 'Policy' },
]

function SentimentDot({ bias }: { bias: string }) {
  const color =
    bias === 'bullish'
      ? 'bg-bullish'
      : bias === 'bearish'
        ? 'bg-bearish'
        : 'bg-neutral'
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`} title={bias} />
}

function dailyChangeColor(pct: number | undefined) {
  if (pct == null) return 'text-gray-500'
  if (pct > 0) return 'text-bullish'
  if (pct < 0) return 'text-bearish'
  return 'text-gray-400'
}

interface SortableTickerRowProps {
  t: WatchlistTicker
  selectedTicker: string | null
  onSelectTicker: (symbol: string) => void
  onRemoveTicker?: (symbol: string) => void
  onAskAI?: (query: string) => void
  quickActionOpen: string | null
  setQuickActionOpen: (s: string | null) => void
  rowRef: ((el: HTMLDivElement | null) => void) | undefined
}

function SortableTickerRow({
  t,
  selectedTicker,
  onSelectTicker,
  onRemoveTicker,
  onAskAI,
  quickActionOpen,
  setQuickActionOpen,
  rowRef,
}: SortableTickerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: t.symbol })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const setRef = (el: HTMLDivElement | null) => {
    setNodeRef(el)
    if (rowRef) rowRef(el)
  }

  const showQuickActions = onAskAI || onRemoveTicker

  return (
    <div
      ref={setRef}
      style={style}
      className={`group relative flex w-full flex-col gap-0.5 rounded px-2 py-1.5 transition-colors hover:bg-charcoal-700 ${
        showQuickActions ? 'pr-10' : ''
      } ${selectedTicker === t.symbol ? 'bg-charcoal-700 ring-1 ring-accent-gold/50' : ''} ${isDragging ? 'z-10 shadow-md' : ''}`}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          className="touch-none shrink-0 cursor-grab rounded p-0.5 text-gray-500 hover:bg-charcoal-600 hover:text-gray-300 active:cursor-grabbing"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSelectTicker(t.symbol)}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left text-xs"
        >
          <div className="flex items-center gap-2">
            <SentimentDot bias={t.sentimentBias} />
            {t.hasBreaking && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-breaking" title="Breaking" />
            )}
            <span className="w-12 shrink-0 font-medium text-gray-200">{t.symbol}</span>
            <span className="min-w-0 flex-1 truncate text-gray-500">{t.companyName}</span>
          </div>
          <div className="flex items-center gap-2 pl-3.5">
            {t.currentPrice != null && (
              <span className="text-gray-300">{t.currentPrice.toFixed(2)}</span>
            )}
            {t.dailyChangePercent != null && (
              <span className={dailyChangeColor(t.dailyChangePercent)}>
                {t.dailyChangePercent >= 0 ? '+' : ''}{t.dailyChangePercent.toFixed(1)}%
              </span>
            )}
            <span className="text-gray-500">{t.signalCountToday} signals</span>
            <span className="text-gray-500">{t.lastSignalAt}</span>
          </div>
        </button>
      </div>
      {showQuickActions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setQuickActionOpen(quickActionOpen === t.symbol ? null : t.symbol)
            }}
            className="rounded p-0.5 text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
            title="Quick actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {showQuickActions && quickActionOpen === t.symbol && (
        <div
          className="absolute right-2 top-full z-10 mt-0.5 min-w-[160px] rounded border border-charcoal-600 bg-charcoal-800 py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onSelectTicker(t.symbol)
              setQuickActionOpen(null)
            }}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
          >
            <Radio className="h-3 w-3" />
            Signals for {t.symbol}
          </button>
          {onAskAI && (
            <button
              type="button"
              onClick={() => {
                onAskAI(`What's the outlook for ${t.symbol}?`)
                setQuickActionOpen(null)
              }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
            >
              <MessageSquare className="h-3 w-3" />
              Ask AI about {t.symbol}
            </button>
          )}
          {onRemoveTicker && (
            <button
              type="button"
              onClick={() => {
                onRemoveTicker(t.symbol)
                setQuickActionOpen(null)
              }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
            >
              <Trash2 className="h-3 w-3" />
              Remove from watchlist
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function LeftPanel({
  summary,
  tickers,
  selectedTicker,
  onSelectTicker,
  activeFilter,
  onFilterChange,
  onRemoveTicker,
  addableTickers = [],
  onAddTicker,
  watchlistOptions = [],
  activeWatchlistId,
  onWatchlistSelect,
  onReorderTicker,
  onAskAI,
}: LeftPanelProps) {
  const [addDropdownOpen, setAddDropdownOpen] = useState(false)
  const [watchlistDropdownOpen, setWatchlistDropdownOpen] = useState(false)
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState<string | null>(null)
  const addDropdownRef = useRef<HTMLDivElement>(null)
  const watchlistDropdownRef = useRef<HTMLDivElement>(null)
  const manageDropdownRef = useRef<HTMLDivElement>(null)
  const quickActionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!addDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setAddDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [addDropdownOpen])

  useEffect(() => {
    if (!watchlistDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (watchlistDropdownRef.current && !watchlistDropdownRef.current.contains(e.target as Node)) {
        setWatchlistDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [watchlistDropdownOpen])

  useEffect(() => {
    if (!manageDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (manageDropdownRef.current && !manageDropdownRef.current.contains(e.target as Node)) {
        setManageDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [manageDropdownOpen])

  useEffect(() => {
    if (!quickActionOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionRef.current?.contains(e.target as Node)) return
      setQuickActionOpen(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [quickActionOpen])

  const showWatchlistDropdown = watchlistOptions.length > 0 && onWatchlistSelect && activeWatchlistId != null

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
  const sensors = useSensors(pointerSensor, keyboardSensor)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorderTicker) return
    const symbols = tickers.map((t) => t.symbol)
    const oldIndex = symbols.indexOf(active.id as string)
    const newIndex = symbols.indexOf(over.id as string)
    if (oldIndex < 0 || newIndex < 0) return
    onReorderTicker(arrayMove(symbols, oldIndex, newIndex))
  }

  return (
    <aside className="flex w-full flex-shrink-0 flex-col border-r border-charcoal-600 bg-charcoal-900 md:min-w-[280px] md:max-w-[300px]">
      {/* Watchlist selector: primary dropdown to change watchlist */}
      <div className="relative border-b border-charcoal-600 p-3" ref={watchlistDropdownRef}>
        <p className="mb-1 text-[10px] uppercase text-gray-500">Watchlist</p>
        <div className="flex items-center gap-1">
          {showWatchlistDropdown ? (
            <button
              type="button"
              onClick={() => setWatchlistDropdownOpen((o) => !o)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-left hover:border-charcoal-500"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-200">{summary.name}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${watchlistDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-200">{summary.name}</span>
          )}
          <div className="relative shrink-0" ref={manageDropdownRef}>
            <button
              type="button"
              onClick={() => setManageDropdownOpen((o) => !o)}
              className="rounded border border-charcoal-600 bg-charcoal-800 p-1.5 text-gray-500 hover:border-charcoal-500 hover:text-gray-300"
              title="Manage watchlist"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            {manageDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-0.5 min-w-[180px] rounded border border-charcoal-600 bg-charcoal-800 py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => setManageDropdownOpen(false)}
                  className="flex w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
                >
                  Edit watchlist name
                </button>
                <button
                  type="button"
                  onClick={() => setManageDropdownOpen(false)}
                  className="flex w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
                >
                  Watchlist settings
                </button>
              </div>
            )}
          </div>
        </div>
        {watchlistDropdownOpen && showWatchlistDropdown && (
          <div className="absolute left-3 right-3 top-full z-20 mt-0.5 rounded border border-charcoal-600 bg-charcoal-800 py-1 shadow-lg">
            {watchlistOptions.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  onWatchlistSelect(w.id)
                  setWatchlistDropdownOpen(false)
                }}
                className={`flex w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-charcoal-700 ${
                  w.id === activeWatchlistId ? 'bg-charcoal-700 text-accent-gold' : 'text-gray-300'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">{summary.trackedCount} tracked</p>
      </div>

      {/* Summary blocks */}
      <div className="grid grid-cols-2 gap-2 border-b border-charcoal-600 p-3">
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Tracked</p>
          <p className="text-sm font-medium text-gray-200">{summary.trackedCount}</p>
        </div>
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Signals today</p>
          <p className="text-sm font-medium text-gray-200">{summary.signalsToday}</p>
        </div>
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Breaking</p>
          <p className="text-sm font-medium text-breaking">{summary.breakingCount}</p>
        </div>
        <div className="rounded border border-charcoal-600 bg-charcoal-800 p-2">
          <p className="text-[10px] uppercase text-gray-500">Bullish ratio</p>
          <p className="text-sm font-medium text-bullish">{(summary.bullishRatio * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Ticker list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {onAddTicker && (
            <div className="relative mb-2" ref={addDropdownRef}>
              <button
                type="button"
                onClick={() => setAddDropdownOpen((o) => !o)}
                className={`flex w-full items-center justify-center gap-1.5 rounded py-2 text-xs font-medium transition-colors ${
                  tickers.length <= 2
                    ? 'border-2 border-accent-gold/60 bg-accent-gold/5 text-accent-gold hover:bg-accent-gold/10'
                    : 'border border-dashed border-charcoal-500 text-gray-400 hover:border-charcoal-400 hover:text-gray-300'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add symbol
              </button>
              {tickers.length === 0 && (
                <p className="mt-2 text-center text-[10px] text-gray-500">Add your first symbols to get signals</p>
              )}
              {tickers.length > 0 && tickers.length <= 2 && (
                <p className="mt-1 text-center text-[10px] text-gray-500">Add more symbols to get signals</p>
              )}
              {addDropdownOpen && addableTickers.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded border border-charcoal-600 bg-charcoal-800 shadow-lg">
                  {addableTickers.map((t) => (
                    <button
                      key={t.symbol}
                      type="button"
                      onClick={() => {
                        onAddTicker(t)
                        setAddDropdownOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
                    >
                      <span className="w-12 shrink-0 font-medium">{t.symbol}</span>
                      <span className="min-w-0 flex-1 truncate text-gray-500">{t.companyName}</span>
                    </button>
                  ))}
                </div>
              )}
              {addDropdownOpen && addableTickers.length === 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-2 text-xs text-gray-500">
                  No symbols to add
                </div>
              )}
            </div>
          )}
          {onReorderTicker ? (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={tickers.map((t) => t.symbol)}
                strategy={verticalListSortingStrategy}
              >
                {tickers.map((t) => (
                  <SortableTickerRow
                    key={t.symbol}
                    t={t}
                    selectedTicker={selectedTicker}
                    onSelectTicker={onSelectTicker}
                    onRemoveTicker={onRemoveTicker}
                    onAskAI={onAskAI}
                    quickActionOpen={quickActionOpen}
                    setQuickActionOpen={setQuickActionOpen}
                    rowRef={quickActionOpen === t.symbol ? (el) => { quickActionRef.current = el } : undefined}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            tickers.map((t) => {
              const showQuickActions = onAskAI || onRemoveTicker
              return (
                <div
                  key={t.symbol}
                  ref={quickActionOpen === t.symbol ? (el) => { quickActionRef.current = el } : undefined}
                  className={`group relative flex w-full flex-col gap-0.5 rounded px-2 py-1.5 transition-colors hover:bg-charcoal-700 ${
                    showQuickActions ? 'pr-10' : ''
                  } ${selectedTicker === t.symbol ? 'bg-charcoal-700 ring-1 ring-accent-gold/50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTicker(t.symbol)}
                    className="flex min-w-0 flex-1 flex-col gap-0.5 text-left text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <SentimentDot bias={t.sentimentBias} />
                      {t.hasBreaking && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-breaking" title="Breaking" />
                      )}
                      <span className="w-12 shrink-0 font-medium text-gray-200">{t.symbol}</span>
                      <span className="min-w-0 flex-1 truncate text-gray-500">{t.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-3.5">
                      {t.currentPrice != null && (
                        <span className="text-gray-300">{t.currentPrice.toFixed(2)}</span>
                      )}
                      {t.dailyChangePercent != null && (
                        <span className={dailyChangeColor(t.dailyChangePercent)}>
                          {t.dailyChangePercent >= 0 ? '+' : ''}{t.dailyChangePercent.toFixed(1)}%
                        </span>
                      )}
                      <span className="text-gray-500">{t.signalCountToday} signals</span>
                      <span className="text-gray-500">{t.lastSignalAt}</span>
                    </div>
                  </button>
                  {showQuickActions && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setQuickActionOpen(quickActionOpen === t.symbol ? null : t.symbol)
                        }}
                        className="rounded p-0.5 text-gray-500 hover:bg-charcoal-600 hover:text-gray-300"
                        title="Quick actions"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {showQuickActions && quickActionOpen === t.symbol && (
                    <div
                      className="absolute right-2 top-full z-10 mt-0.5 min-w-[160px] rounded border border-charcoal-600 bg-charcoal-800 py-1 shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTicker(t.symbol)
                          setQuickActionOpen(null)
                        }}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
                      >
                        <Radio className="h-3 w-3" />
                        Signals for {t.symbol}
                      </button>
                      {onAskAI && (
                        <button
                          type="button"
                          onClick={() => {
                            onAskAI(`What's the outlook for ${t.symbol}?`)
                            setQuickActionOpen(null)
                          }}
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Ask AI about {t.symbol}
                        </button>
                      )}
                      {onRemoveTicker && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveTicker(t.symbol)
                            setQuickActionOpen(null)
                          }}
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-charcoal-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove from watchlist
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-charcoal-600 p-3">
        {FILTER_CHIPS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={`rounded border px-2 py-1 text-[10px] transition-colors ${
              activeFilter === id
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  )
}
