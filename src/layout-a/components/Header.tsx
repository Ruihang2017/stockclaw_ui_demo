import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  Radio,
} from 'lucide-react'

interface HeaderProps {
  watchlistName: string
  newSignalsCount: number
  lang: 'en' | 'zh'
  onLangToggle: () => void
}

export function Header({
  watchlistName,
  newSignalsCount,
  lang,
  onLangToggle,
}: HeaderProps) {
  return (
    <header className="flex h-11 items-center gap-4 border-b border-charcoal-600 bg-charcoal-900 px-4 shadow-panel">
      <span className="text-sm font-semibold text-accent-gold">StockClaw</span>
      <div className="flex items-center gap-2 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-xs">
        <span className="text-gray-300">{watchlistName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div className="flex flex-1 max-w-md items-center gap-2 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search signals, tickers..."
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-system">
          <Radio className="h-3.5 w-3.5" />
          <span>LIVE</span>
        </div>
        {newSignalsCount > 0 && (
          <span className="rounded bg-breaking/20 px-1.5 py-0.5 text-xs text-breaking">
            {newSignalsCount} new
          </span>
        )}
        <button
          type="button"
          onClick={onLangToggle}
          className="flex gap-1 text-xs text-gray-400 hover:text-gray-200"
        >
          <span className={lang === 'en' ? 'text-accent-gold' : ''}>EN</span>
          <span>|</span>
          <span className={lang === 'zh' ? 'text-accent-gold' : ''}>中文</span>
        </button>
        <button type="button" className="text-gray-500 hover:text-gray-300">
          <Bell className="h-4 w-4" />
        </button>
        <button type="button" className="text-gray-500 hover:text-gray-300">
          <Settings className="h-4 w-4" />
        </button>
        <div className="h-6 w-6 rounded-full bg-charcoal-600" title="User avatar" />
      </div>
    </header>
  )
}
