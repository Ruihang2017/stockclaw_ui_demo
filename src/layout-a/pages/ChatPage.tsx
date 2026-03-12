import { useRef, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import { RAGModule } from '../components/RAGModule'

export function ChatPage() {
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
    <div className="flex h-screen flex-col bg-charcoal-950 text-gray-200">
      <header className="flex shrink-0 items-center gap-3 border-b border-charcoal-600 bg-charcoal-900 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-xs text-gray-200 hover:border-charcoal-500 hover:text-gray-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <h1 className="text-sm font-medium text-accent-gold">Ask StockClaw</h1>
      </header>

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
          <RAGModule
            lang="en"
            onOpenInChat={(query) => sendMessage(query)}
          />
        </div>
      </div>
    </div>
  )
}
