import { useEffect, useState } from 'react'
import type { WatchlistSettings, WatchlistSentimentFilter } from '../types'
import { DEFAULT_WATCHLIST_SETTINGS } from '../types'

interface WatchlistSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  watchlistId: string
  watchlistName: string
  settings: WatchlistSettings
  onSave: (id: string, settings: WatchlistSettings) => void
}

const SENTIMENT_OPTIONS: { value: WatchlistSentimentFilter; label: string }[] = [
  { value: 'all', label: 'All sentiments' },
  { value: 'bullish', label: 'Bullish only' },
  { value: 'bearish', label: 'Bearish only' },
  { value: 'neutral', label: 'Neutral only' },
]

function mergeSettings(settings: WatchlistSettings): WatchlistSettings {
  return { ...DEFAULT_WATCHLIST_SETTINGS, ...settings }
}

export function WatchlistSettingsModal({
  isOpen,
  onClose,
  watchlistId,
  watchlistName,
  settings,
  onSave,
}: WatchlistSettingsModalProps) {
  const full = mergeSettings(settings)
  const [notifyBreaking, setNotifyBreaking] = useState(full.notifyBreaking)
  const [notifyDigest, setNotifyDigest] = useState(full.notifyDigest)
  const [minImpactScore, setMinImpactScore] = useState(full.minImpactScore)
  const [minConfidence, setMinConfidence] = useState(full.minConfidence)
  const [sentimentFilter, setSentimentFilter] = useState<WatchlistSentimentFilter>(full.sentimentFilter)
  const [includeMacro, setIncludeMacro] = useState(full.includeMacro)
  const [includeEarnings, setIncludeEarnings] = useState(full.includeEarnings)
  const [includePolicy, setIncludePolicy] = useState(full.includePolicy)

  useEffect(() => {
    if (isOpen) {
      const s = mergeSettings(settings)
      setNotifyBreaking(s.notifyBreaking)
      setNotifyDigest(s.notifyDigest)
      setMinImpactScore(s.minImpactScore)
      setMinConfidence(s.minConfidence)
      setSentimentFilter(s.sentimentFilter)
      setIncludeMacro(s.includeMacro)
      setIncludeEarnings(s.includeEarnings)
      setIncludePolicy(s.includePolicy)
    }
  }, [isOpen, settings])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(watchlistId, {
      notifyBreaking,
      notifyDigest,
      minImpactScore,
      minConfidence,
      sentimentFilter,
      includeMacro,
      includeEarnings,
      includePolicy,
    })
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded border border-charcoal-600 bg-charcoal-900 p-4 shadow-panel">
        <h2 className="mb-1 text-sm font-medium text-gray-200">Watchlist settings</h2>
        <p className="mb-4 text-xs text-gray-500">{watchlistName}</p>

        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Notifications</h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={notifyBreaking}
                onChange={(e) => setNotifyBreaking(e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Notify on BREAKING for this watchlist
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={notifyDigest}
                onChange={(e) => setNotifyDigest(e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Daily digest for this watchlist
            </label>
          </div>
        </section>

        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Feed filters</h3>
          <p className="mb-2 text-[10px] text-gray-500">Minimum thresholds for signals shown in this watchlist’s feed.</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] text-gray-500">Min impact score (1–10)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={minImpactScore}
                  onChange={(e) => setMinImpactScore(Number(e.target.value))}
                  className="flex-1 accent-accent-gold"
                />
                <span className="w-6 text-right text-xs text-gray-300">{minImpactScore}</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-gray-500">Min confidence (0–100%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="flex-1 accent-accent-gold"
                />
                <span className="w-10 text-right text-xs text-gray-300">{minConfidence}%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Sentiment</h3>
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as WatchlistSentimentFilter)}
            className="w-full rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-xs text-gray-200 focus:border-charcoal-500 focus:outline-none"
          >
            {SENTIMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Categories</h3>
          <p className="mb-2 text-[10px] text-gray-500">Include these signal categories in the feed.</p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={includeMacro}
                onChange={(e) => setIncludeMacro(e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Macro
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={includeEarnings}
                onChange={(e) => setIncludeEarnings(e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Earnings
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={includePolicy}
                onChange={(e) => setIncludePolicy(e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Policy
            </label>
          </div>
        </section>

        <footer className="flex justify-end gap-2 border-t border-charcoal-600 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-charcoal-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-charcoal-700"
          >
            Save
          </button>
        </footer>
      </div>
    </>
  )
}
