import { useEffect, useRef, useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import type { ChatMessage as ChatMessageType, ChatContext } from '../types'

interface ChatSlideOverProps {
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
  lang: 'en' | 'zh'
  messages: ChatMessageType[]
  onSendMessage: (content: string) => void
  initialQuery?: string | null
  initialContext?: ChatContext | null
  onInitialConsumed?: () => void
  onNewChat?: () => void
}

function contextLabel(ctx: ChatContext): string {
  if (ctx.type === 'ticker') return `Re: ${ctx.symbol}`
  return `Re: signal ${ctx.signalId}`
}

export function ChatSlideOver({
  isOpen,
  onClose,
  onOpen,
  messages,
  onSendMessage,
  initialQuery,
  initialContext,
  onInitialConsumed,
  onNewChat,
}: ChatSlideOverProps) {
  const [inputValue, setInputValue] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && initialQuery) {
      setInputValue(initialQuery)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen, initialQuery])

  useEffect(() => {
    if (isOpen) bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [isOpen, messages])

  const handleClose = () => {
    onInitialConsumed?.()
    onClose()
  }

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    onSendMessage(text)
    setInputValue('')
    onInitialConsumed?.()
  }

  const dialogContent = (
    <>
        <div className="flex shrink-0 items-center justify-between border-b border-charcoal-600 px-4 py-3">
          <h2 className="text-sm font-medium text-gray-200">Ask StockClaw</h2>
          <div className="flex items-center gap-1">
            {onNewChat && (
              <button
                type="button"
                onClick={() => { setInputValue(''); onNewChat() }}
                className="rounded px-2 py-1 text-[10px] text-gray-400 hover:bg-charcoal-700 hover:text-gray-200"
              >
                New Chat
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="rounded p-1 text-gray-500 hover:bg-charcoal-700 hover:text-gray-300"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {initialContext && (
          <div className="shrink-0 border-b border-charcoal-600 px-4 py-2 text-[10px] uppercase text-gray-500">
            {contextLabel(initialContext)}
          </div>
        )}
        <div
          ref={bodyRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3"
        >
          {messages.length === 0 && !initialQuery && (
            <p className="text-xs text-gray-500">Ask about signals, tickers, or market context. Your conversation will appear here.</p>
          )}
          {messages.map((m, i) => (
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
        <div className="shrink-0 border-t border-charcoal-600 p-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
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
        </div>
    </>
  )

  return (
    <>
      {!isOpen && onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal-600 bg-charcoal-800 text-accent-gold shadow-lg hover:bg-charcoal-700 hover:border-charcoal-500"
          aria-label="Ask StockClaw"
          title="Ask StockClaw"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden
            onClick={handleClose}
          />
          <div
            className="fixed bottom-4 right-4 z-50 flex w-[400px] max-w-[calc(100vw-2rem)] max-h-[70vh] flex-col rounded-lg border border-charcoal-600 bg-charcoal-900 shadow-panel"
            role="dialog"
            aria-label="Ask StockClaw"
          >
            {dialogContent}
          </div>
        </>
      )}
    </>
  )
}
