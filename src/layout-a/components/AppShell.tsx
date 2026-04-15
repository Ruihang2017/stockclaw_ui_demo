import { useNavigate, Outlet } from 'react-router-dom'
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
