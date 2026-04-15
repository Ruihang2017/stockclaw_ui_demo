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
