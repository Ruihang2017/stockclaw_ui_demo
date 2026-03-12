import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ChatMessage } from '../types'

const STORAGE_KEY = 'stockclaw_chat'

export interface Conversation {
  id: string
  messages: ChatMessage[]
}

interface ChatContextValue {
  conversations: Conversation[]
  activeConversationId: string
  activeMessages: ChatMessage[]
  sendMessage: (content: string) => void
  newChat: () => void
  setActiveConversationId: (id: string) => void
}

function loadFromStorage(): { conversations: Conversation[]; activeId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { conversations: [], activeId: '' }
    const data = JSON.parse(raw) as { conversations: Conversation[]; activeConversationId: string }
    const conversations = Array.isArray(data.conversations) ? data.conversations : []
    const activeId = typeof data.activeConversationId === 'string' ? data.activeConversationId : ''
    return { conversations, activeId }
  } catch {
    return { conversations: [], activeId: '' }
  }
}

function saveToStorage(conversations: Conversation[], activeConversationId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, activeConversationId }))
  } catch {}
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(loadFromStorage)

  const sendMessage = useCallback((content: string) => {
    const placeholder = 'This is a placeholder reply. In production, this would call your RAG/agent API.'
    setState((prev) => {
      let list = prev.conversations
      let activeId = prev.activeId
      if (list.length === 0) {
        activeId = `conv-${Date.now()}`
        list = [{ id: activeId, messages: [] }]
      } else if (!activeId || !list.some((c) => c.id === activeId)) {
        activeId = list[0].id
      }
      const conv = list.find((c) => c.id === activeId)
      const messages: ChatMessage[] = conv
        ? [...conv.messages, { role: 'user', content }, { role: 'assistant', content: placeholder }]
        : [
            { role: 'user', content },
            { role: 'assistant', content: placeholder },
          ]
      const nextList = list.map((c) => (c.id === activeId ? { ...c, messages } : c))
      saveToStorage(nextList, activeId)
      return { conversations: nextList, activeId }
    })
  }, [])

  const newChat = useCallback(() => {
    const id = `conv-${Date.now()}`
    setState((prev) => {
      const next = {
        conversations: [...prev.conversations, { id, messages: [] }],
        activeId: id,
      }
      saveToStorage(next.conversations, next.activeId)
      return next
    })
  }, [])

  const setActiveConversationId = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.conversations.some((c) => c.id === id)) return prev
      saveToStorage(prev.conversations, id)
      return { ...prev, activeId: id }
    })
  }, [])

  const activeConversation = state.conversations.find((c) => c.id === state.activeId)
  const effectiveActiveId =
    state.activeId && state.conversations.some((c) => c.id === state.activeId)
      ? state.activeId
      : state.conversations[0]?.id ?? ''
  const activeMessages = activeConversation?.messages ?? []

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations: state.conversations,
      activeConversationId: effectiveActiveId,
      activeMessages,
      sendMessage,
      newChat,
      setActiveConversationId,
    }),
    [state.conversations, effectiveActiveId, activeMessages, sendMessage, newChat, setActiveConversationId]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
