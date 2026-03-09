import type { WatchlistOption } from '../types'

interface NotificationToggles {
  emailDigest: boolean
  push: boolean
  breakingOnly: boolean
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  lang: 'en' | 'zh'
  onLangChange: (lang: 'en' | 'zh') => void
  dateFormat: 'relative' | 'absolute'
  onDateFormatChange: (format: 'relative' | 'absolute') => void
  notificationToggles: NotificationToggles
  onNotificationChange: (key: keyof NotificationToggles, value: boolean) => void
  defaultWatchlistId: string
  watchlistOptions: WatchlistOption[]
  onDefaultWatchlistChange: (id: string) => void
  feedbackHref: string
}

export function SettingsModal({
  isOpen,
  onClose,
  lang,
  onLangChange,
  dateFormat,
  onDateFormatChange,
  notificationToggles,
  onNotificationChange,
  defaultWatchlistId,
  watchlistOptions,
  onDefaultWatchlistChange,
  feedbackHref,
}: SettingsModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded border border-charcoal-600 bg-charcoal-900 p-4 shadow-panel">
        <h2 className="mb-3 text-sm font-medium text-gray-200">Settings</h2>

        {/* Display */}
        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Display</h3>
          <div className="space-y-2">
            <div>
              <p className="mb-1 text-[10px] text-gray-500">Default language</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onLangChange('en')}
                  className={`rounded border px-2 py-1 text-xs ${
                    lang === 'en'
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                      : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLangChange('zh')}
                  className={`rounded border px-2 py-1 text-xs ${
                    lang === 'zh'
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                      : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500'
                  }`}
                >
                  中文
                </button>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] text-gray-500">Date format</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDateFormatChange('relative')}
                  className={`rounded border px-2 py-1 text-xs ${
                    dateFormat === 'relative'
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                      : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500'
                  }`}
                >
                  Relative (2m ago)
                </button>
                <button
                  type="button"
                  onClick={() => onDateFormatChange('absolute')}
                  className={`rounded border px-2 py-1 text-xs ${
                    dateFormat === 'absolute'
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                      : 'border-charcoal-600 bg-charcoal-800 text-gray-400 hover:border-charcoal-500'
                  }`}
                >
                  Absolute
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Notifications</h3>
          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={notificationToggles.emailDigest}
                onChange={(e) => onNotificationChange('emailDigest', e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Email digest
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={notificationToggles.push}
                onChange={(e) => onNotificationChange('push', e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              Browser push
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={notificationToggles.breakingOnly}
                onChange={(e) => onNotificationChange('breakingOnly', e.target.checked)}
                className="rounded border-charcoal-500 bg-charcoal-800 text-accent-gold focus:ring-accent-gold/50"
              />
              BREAKING only
            </label>
          </div>
        </section>

        {/* Default watchlist */}
        <section className="mb-4 border-b border-charcoal-600 pb-3">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">Default watchlist</h3>
          <select
            value={defaultWatchlistId}
            onChange={(e) => onDefaultWatchlistChange(e.target.value)}
            className="w-full rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-xs text-gray-200 focus:border-charcoal-500 focus:outline-none"
          >
            {watchlistOptions.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </section>

        {/* About */}
        <section className="mb-4">
          <h3 className="mb-2 text-[10px] uppercase text-gray-500">About</h3>
          <p className="text-xs text-gray-400">StockClaw Dashboard Demo v2 — mock data only.</p>
          <a
            href={feedbackHref}
            className="mt-1 inline-block text-xs text-accent-gold hover:underline"
          >
            Give feedback
          </a>
        </section>

        <footer className="flex justify-end border-t border-charcoal-600 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-charcoal-700"
          >
            Close
          </button>
        </footer>
      </div>
    </>
  )
}
