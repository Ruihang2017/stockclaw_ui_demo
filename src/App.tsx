import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatProvider } from '@/layout-a/context/ChatContext'
import { StockClawDashboard } from '@/layout-a/StockClawDashboard'
import { ChatPage } from '@/layout-a/pages/ChatPage'
import { StockDetailPage } from '@/layout-a/pages/StockDetailPage'

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<StockClawDashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/stock/:symbol" element={<StockDetailPage />} />
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App
