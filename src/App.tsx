import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatProvider } from '@/layout-a/context/ChatContext'
import { DashboardStateProvider } from '@/layout-a/context/DashboardStateContext'
import { AppShell } from '@/layout-a/components/AppShell'
import { DashboardTab } from '@/layout-a/pages/DashboardTab'
import { WatchlistTab } from '@/layout-a/pages/WatchlistTab'
import { ChatTab } from '@/layout-a/pages/ChatTab'
import { SettingsTab } from '@/layout-a/pages/SettingsTab'
import { StockDetailPage } from '@/layout-a/pages/StockDetailPage'

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <DashboardStateProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardTab />} />
              <Route path="/watchlist" element={<WatchlistTab />} />
              <Route path="/chat" element={<ChatTab />} />
              <Route path="/settings" element={<SettingsTab />} />
              <Route path="/stock/:symbol" element={<StockDetailPage />} />
            </Route>
          </Routes>
        </DashboardStateProvider>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App
