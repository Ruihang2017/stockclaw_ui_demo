import type { WatchlistTicker, WatchlistSummary, Signal, RAGResult, MarketIndex, StockPriceData, CompanyFundamentals, WatchlistOption, NotificationItem } from './types'

export const WATCHLIST_SUMMARY: WatchlistSummary = {
  name: 'My Swing Watchlist',
  trackedCount: 28,
  signalsToday: 12,
  breakingCount: 2,
  bullishRatio: 0.62,
  mostActiveAgent: 'Macro Pulse',
}

export const MOCK_WATCHLISTS: WatchlistOption[] = [
  { id: 'swing', name: 'My Swing Watchlist' },
  { id: 'tech', name: 'Tech Focus' },
]

// Tech Focus: subset of tickers (semis + big tech)
const TECH_FOCUS_TICKERS: WatchlistTicker[] = [
  { symbol: 'NVDA', companyName: 'NVIDIA Corp', market: 'US', sector: 'Semiconductors', signalCountToday: 4, lastSignalAt: '2m ago', sentimentBias: 'bearish', hasBreaking: true, currentPrice: 912.45, dailyChangePercent: 1.8 },
  { symbol: 'AMD', companyName: 'Advanced Micro', market: 'US', sector: 'Semiconductors', signalCountToday: 3, lastSignalAt: '8m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 178.32, dailyChangePercent: -0.4 },
  { symbol: 'TSM', companyName: 'Taiwan Semi', market: 'TW', sector: 'Semiconductors', signalCountToday: 2, lastSignalAt: '15m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 142.88, dailyChangePercent: 0.8 },
  { symbol: 'AAPL', companyName: 'Apple Inc', market: 'US', sector: 'Technology', signalCountToday: 1, lastSignalAt: '22m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 228.15, dailyChangePercent: 0.2 },
  { symbol: 'MSFT', companyName: 'Microsoft', market: 'US', sector: 'Technology', signalCountToday: 2, lastSignalAt: '31m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 415.62, dailyChangePercent: 0.6 },
  { symbol: 'META', companyName: 'Meta Platforms', market: 'US', sector: 'Technology', signalCountToday: 1, lastSignalAt: '45m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 512.30, dailyChangePercent: 1.2 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc', market: 'US', sector: 'Technology', signalCountToday: 1, lastSignalAt: '38m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 172.50, dailyChangePercent: 0.9 },
  { symbol: 'AVGO', companyName: 'Broadcom Inc', market: 'US', sector: 'Semiconductors', signalCountToday: 1, lastSignalAt: '52m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 168.75, dailyChangePercent: 0.3 },
]

const TECH_FOCUS_SUMMARY: WatchlistSummary = {
  name: 'Tech Focus',
  trackedCount: 8,
  signalsToday: 15,
  breakingCount: 1,
  bullishRatio: 0.67,
  mostActiveAgent: 'Earnings Scout',
}

export const WATCHLIST_TICKERS: WatchlistTicker[] = [
  { symbol: 'NVDA', companyName: 'NVIDIA Corp', market: 'US', sector: 'Semiconductors', signalCountToday: 4, lastSignalAt: '2m ago', sentimentBias: 'bearish', hasBreaking: true, currentPrice: 912.45, dailyChangePercent: 1.8 },
  { symbol: 'AMD', companyName: 'Advanced Micro', market: 'US', sector: 'Semiconductors', signalCountToday: 3, lastSignalAt: '8m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 178.32, dailyChangePercent: -0.4 },
  { symbol: 'TSM', companyName: 'Taiwan Semi', market: 'TW', sector: 'Semiconductors', signalCountToday: 2, lastSignalAt: '15m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 142.88, dailyChangePercent: 0.8 },
  { symbol: 'AAPL', companyName: 'Apple Inc', market: 'US', sector: 'Technology', signalCountToday: 1, lastSignalAt: '22m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 228.15, dailyChangePercent: 0.2 },
  { symbol: 'MSFT', companyName: 'Microsoft', market: 'US', sector: 'Technology', signalCountToday: 2, lastSignalAt: '31m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 415.62, dailyChangePercent: 0.6 },
  { symbol: 'META', companyName: 'Meta Platforms', market: 'US', sector: 'Technology', signalCountToday: 1, lastSignalAt: '45m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 512.30, dailyChangePercent: 1.2 },
  { symbol: 'BABA', companyName: 'Alibaba Group', market: 'HK', sector: 'E-commerce', signalCountToday: 2, lastSignalAt: '1h ago', sentimentBias: 'bearish', hasBreaking: true, currentPrice: 72.45, dailyChangePercent: -2.1 },
  { symbol: 'TSLA', companyName: 'Tesla Inc', market: 'US', sector: 'Auto', signalCountToday: 1, lastSignalAt: '1h ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 248.90, dailyChangePercent: -0.5 },
  { symbol: 'SMCI', companyName: 'Super Micro', market: 'US', sector: 'Hardware', signalCountToday: 3, lastSignalAt: '18m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 885.20, dailyChangePercent: 2.4 },
  { symbol: 'AVGO', companyName: 'Broadcom Inc', market: 'US', sector: 'Semiconductors', signalCountToday: 1, lastSignalAt: '52m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 168.75, dailyChangePercent: 0.3 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc', market: 'US', sector: 'Technology', signalCountToday: 1, lastSignalAt: '38m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 172.50, dailyChangePercent: 0.9 },
  { symbol: 'INTC', companyName: 'Intel Corp', market: 'US', sector: 'Semiconductors', signalCountToday: 2, lastSignalAt: '25m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 42.18, dailyChangePercent: -0.6 },
]

export const WATCHLIST_BY_ID: Record<string, { summary: WatchlistSummary; tickers: WatchlistTicker[] }> = {
  swing: { summary: WATCHLIST_SUMMARY, tickers: WATCHLIST_TICKERS },
  tech: { summary: TECH_FOCUS_SUMMARY, tickers: TECH_FOCUS_TICKERS },
}

// Tickers that can be added to any watchlist (not in default swing/tech lists)
export const ADDABLE_TICKERS: WatchlistTicker[] = [
  { symbol: 'SPY', companyName: 'SPDR S&P 500 ETF', market: 'US', sector: 'ETF', signalCountToday: 0, lastSignalAt: '—', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 518.20, dailyChangePercent: 0.4 },
  { symbol: 'QQQ', companyName: 'Invesco QQQ Trust', market: 'US', sector: 'ETF', signalCountToday: 1, lastSignalAt: '1h ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 455.80, dailyChangePercent: 0.9 },
  { symbol: 'JPM', companyName: 'JPMorgan Chase', market: 'US', sector: 'Financials', signalCountToday: 2, lastSignalAt: '45m ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 198.50, dailyChangePercent: 0.2 },
  { symbol: 'DIS', companyName: 'Walt Disney Co', market: 'US', sector: 'Entertainment', signalCountToday: 1, lastSignalAt: '2h ago', sentimentBias: 'bearish', hasBreaking: false, currentPrice: 112.30, dailyChangePercent: -0.5 },
  { symbol: 'NFLX', companyName: 'Netflix Inc', market: 'US', sector: 'Technology', signalCountToday: 2, lastSignalAt: '30m ago', sentimentBias: 'bullish', hasBreaking: false, currentPrice: 485.60, dailyChangePercent: 1.1 },
  { symbol: 'COIN', companyName: 'Coinbase Global', market: 'US', sector: 'Financials', signalCountToday: 1, lastSignalAt: '1h ago', sentimentBias: 'neutral', hasBreaking: false, currentPrice: 248.20, dailyChangePercent: 2.2 },
]

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: '2 new BREAKING signals in your watchlist', time: '2m ago', type: 'breaking' },
  { id: 'n2', title: 'Watchlist "My Swing Watchlist" updated', time: '5m ago', type: 'info' },
  { id: 'n3', title: 'NVDA — Signal from Macro Pulse', time: '8m ago', type: 'breaking' },
  { id: 'n4', title: 'TSM earnings signal from Earnings Scout', time: '12m ago', type: 'info' },
  { id: 'n5', title: '3 new signals in Tech Focus', time: '18m ago', type: 'info' },
]

// Sparkline trend: ~24 points (e.g. hourly). Values normalized for display.
function sparkline(base: number, changePct: number, points = 24): number[] {
  const arr: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    const drift = changePct * 0.01 * base * (t * 0.7 + Math.sin(t * Math.PI) * 0.3)
    arr.push(base + (base * (i / points) * (changePct / 100) * 0.5) + drift * (i / points))
  }
  return arr
}

export const MARKET_INDEXES: MarketIndex[] = [
  { name: 'S&P 500', symbol: 'SPX', value: 5187.3, changePercent: 0.42, trend: sparkline(5180, 0.42) },
  { name: 'Nasdaq 100', symbol: 'NDX', value: 18240.8, changePercent: 0.88, trend: sparkline(18180, 0.88) },
  { name: 'Dow Jones', symbol: 'DJI', value: 38742.5, changePercent: 0.31, trend: sparkline(38650, 0.31) },
  { name: 'VIX', symbol: 'VIX', value: 14.2, changePercent: -3.1, trend: sparkline(14.6, -3.1) },
  { name: 'SOX', symbol: 'SOX', value: 4521.0, changePercent: 0.65, trend: sparkline(4510, 0.65) },
]

// Stock price and mini-chart data per symbol. trend arrays: 1D ~30 pts, 5D ~20, 1M ~22.
function trend1D(price: number, changePct: number, n = 30): number[] {
  const out: number[] = []
  const mult = (changePct / 100) * price
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    out.push(price - mult + (mult * t) + (Math.sin(t * Math.PI) * price * 0.002))
  }
  return out
}
function trend5D(price: number, changePct: number, n = 20): number[] {
  const out: number[] = []
  const mult = (changePct / 100) * price * 0.6
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    out.push(price - mult + (mult * t) + (Math.sin(t * 2) * price * 0.005))
  }
  return out
}
function trend1M(price: number, changePct: number, n = 22): number[] {
  const out: number[] = []
  const mult = (changePct / 100) * price * 1.2
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    out.push(price - mult + (mult * t) + (Math.sin(t * 3) * price * 0.008))
  }
  return out
}

export const STOCK_PRICE_BY_SYMBOL: Record<string, StockPriceData> = {
  NVDA: { currentPrice: 912.45, dailyChange: 16.12, dailyChangePercent: 1.8, trend1D: trend1D(912.45, 1.8), trend5D: trend5D(912.45, 1.8), trend1M: trend1M(912.45, 1.8), volume: 42_500_000, relativeStrengthLabel: 'Outperforming SOX +1.2%' },
  AMD: { currentPrice: 178.32, dailyChange: -0.71, dailyChangePercent: -0.4, trend1D: trend1D(178.32, -0.4), trend5D: trend5D(178.32, -0.4), trend1M: trend1M(178.32, -0.4), volume: 58_200_000, relativeStrengthLabel: 'In line with SOX' },
  TSM: { currentPrice: 142.88, dailyChange: 1.14, dailyChangePercent: 0.8, trend1D: trend1D(142.88, 0.8), trend5D: trend5D(142.88, 0.8), trend1M: trend1M(142.88, 0.8), volume: 22_100_000, relativeStrengthLabel: 'Outperforming HSCEI +0.5%' },
  AAPL: { currentPrice: 228.15, dailyChange: 0.46, dailyChangePercent: 0.2, trend1D: trend1D(228.15, 0.2), trend5D: trend5D(228.15, 0.2), trend1M: trend1M(228.15, 0.2), volume: 48_000_000, relativeStrengthLabel: 'In line with SPX' },
  MSFT: { currentPrice: 415.62, dailyChange: 2.49, dailyChangePercent: 0.6, trend1D: trend1D(415.62, 0.6), trend5D: trend5D(415.62, 0.6), trend1M: trend1M(415.62, 0.6), volume: 18_500_000, relativeStrengthLabel: 'Outperforming NDX +0.3%' },
  META: { currentPrice: 512.30, dailyChange: 6.15, dailyChangePercent: 1.2, trend1D: trend1D(512.30, 1.2), trend5D: trend5D(512.30, 1.2), trend1M: trend1M(512.30, 1.2), volume: 12_300_000, relativeStrengthLabel: 'Outperforming NDX +0.4%' },
  BABA: { currentPrice: 72.45, dailyChange: -1.55, dailyChangePercent: -2.1, trend1D: trend1D(72.45, -2.1), trend5D: trend5D(72.45, -2.1), trend1M: trend1M(72.45, -2.1), volume: 28_400_000, relativeStrengthLabel: 'Underperforming HSCEI -1.2%' },
  TSLA: { currentPrice: 248.90, dailyChange: -1.25, dailyChangePercent: -0.5, trend1D: trend1D(248.90, -0.5), trend5D: trend5D(248.90, -0.5), trend1M: trend1M(248.90, -0.5), volume: 95_000_000, relativeStrengthLabel: 'In line with sector' },
  SMCI: { currentPrice: 885.20, dailyChange: 20.75, dailyChangePercent: 2.4, trend1D: trend1D(885.20, 2.4), trend5D: trend5D(885.20, 2.4), trend1M: trend1M(885.20, 2.4), volume: 8_200_000, relativeStrengthLabel: 'Outperforming SOX +1.8%' },
  AVGO: { currentPrice: 168.75, dailyChange: 0.51, dailyChangePercent: 0.3, trend1D: trend1D(168.75, 0.3), trend5D: trend5D(168.75, 0.3), trend1M: trend1M(168.75, 0.3), volume: 3_800_000, relativeStrengthLabel: 'In line with SOX' },
  GOOGL: { currentPrice: 172.50, dailyChange: 1.54, dailyChangePercent: 0.9, trend1D: trend1D(172.50, 0.9), trend5D: trend5D(172.50, 0.9), trend1M: trend1M(172.50, 0.9), volume: 24_000_000, relativeStrengthLabel: 'In line with NDX' },
  INTC: { currentPrice: 42.18, dailyChange: -0.25, dailyChangePercent: -0.6, trend1D: trend1D(42.18, -0.6), trend5D: trend5D(42.18, -0.6), trend1M: trend1M(42.18, -0.6), volume: 38_000_000, relativeStrengthLabel: 'Underperforming SOX -0.4%' },
  SPY: { currentPrice: 518.20, dailyChange: 2.08, dailyChangePercent: 0.4, trend1D: trend1D(518.20, 0.4), trend5D: trend5D(518.20, 0.4), trend1M: trend1M(518.20, 0.4), volume: 65_000_000, relativeStrengthLabel: 'S&P 500 ETF' },
  QQQ: { currentPrice: 455.80, dailyChange: 4.06, dailyChangePercent: 0.9, trend1D: trend1D(455.80, 0.9), trend5D: trend5D(455.80, 0.9), trend1M: trend1M(455.80, 0.9), volume: 42_000_000, relativeStrengthLabel: 'Nasdaq 100 ETF' },
  JPM: { currentPrice: 198.50, dailyChange: 0.40, dailyChangePercent: 0.2, trend1D: trend1D(198.50, 0.2), trend5D: trend5D(198.50, 0.2), trend1M: trend1M(198.50, 0.2), volume: 8_500_000, relativeStrengthLabel: 'In line with sector' },
  DIS: { currentPrice: 112.30, dailyChange: -0.56, dailyChangePercent: -0.5, trend1D: trend1D(112.30, -0.5), trend5D: trend5D(112.30, -0.5), trend1M: trend1M(112.30, -0.5), volume: 12_000_000, relativeStrengthLabel: 'Underperforming SPX' },
  NFLX: { currentPrice: 485.60, dailyChange: 5.29, dailyChangePercent: 1.1, trend1D: trend1D(485.60, 1.1), trend5D: trend5D(485.60, 1.1), trend1M: trend1M(485.60, 1.1), volume: 4_200_000, relativeStrengthLabel: 'Outperforming NDX' },
  COIN: { currentPrice: 248.20, dailyChange: 5.34, dailyChangePercent: 2.2, trend1D: trend1D(248.20, 2.2), trend5D: trend5D(248.20, 2.2), trend1M: trend1M(248.20, 2.2), volume: 15_000_000, relativeStrengthLabel: 'Crypto sector' },
}

export const COMPANY_FUNDAMENTALS_BY_SYMBOL: Record<string, CompanyFundamentals> = {
  NVDA: { companyName: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', marketCap: '$2.25T', peRatio: 68.2, evEbitda: 52.1, week52Low: 685.2, week52High: 974.0, revenueGrowth: '+122% YoY', grossMargin: '74.2%', nextEarnings: 'May 22, 2025', beta: 1.72, dividendYield: '0.02%' },
  AMD: { companyName: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', marketCap: '$288B', peRatio: 42.5, evEbitda: 28.3, week52Low: 138.5, week52High: 192.0, revenueGrowth: '+18% YoY', grossMargin: '50.1%', nextEarnings: 'Apr 30, 2025', beta: 1.65, dividendYield: null },
  TSM: { companyName: 'Taiwan Semiconductor Manufacturing', exchange: 'NYSE', sector: 'Technology', industry: 'Semiconductors', marketCap: '$592B', peRatio: 24.8, evEbitda: 14.2, week52Low: 118.0, week52High: 158.5, revenueGrowth: '+22% YoY', grossMargin: '53.4%', nextEarnings: 'Apr 17, 2025', beta: 1.18, dividendYield: '1.8%' },
  AAPL: { companyName: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics', marketCap: '$3.52T', peRatio: 28.5, evEbitda: 22.1, week52Low: 198.0, week52High: 245.0, revenueGrowth: '+2% YoY', grossMargin: '44.1%', nextEarnings: 'May 1, 2025', beta: 1.28, dividendYield: '0.52%' },
  MSFT: { companyName: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software—Infrastructure', marketCap: '$3.08T', peRatio: 35.2, evEbitda: 24.5, week52Low: 378.0, week52High: 430.0, revenueGrowth: '+12% YoY', grossMargin: '69.2%', nextEarnings: 'Apr 24, 2025', beta: 0.92, dividendYield: '0.74%' },
  META: { companyName: 'Meta Platforms, Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Content & Information', marketCap: '$1.31T', peRatio: 26.8, evEbitda: 14.8, week52Low: 435.0, week52High: 535.0, revenueGrowth: '+25% YoY', grossMargin: '81.2%', nextEarnings: 'Apr 30, 2025', beta: 1.22, dividendYield: '0.42%' },
  BABA: { companyName: 'Alibaba Group Holding Limited', exchange: 'NYSE', sector: 'Consumer Cyclical', industry: 'E-commerce', marketCap: '$178B', peRatio: 12.5, evEbitda: 6.2, week52Low: 62.0, week52High: 95.0, revenueGrowth: '+5% YoY', grossMargin: '38.5%', nextEarnings: 'May 8, 2025', beta: 0.85, dividendYield: '1.2%' },
  TSLA: { companyName: 'Tesla, Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: '$792B', peRatio: 72.5, evEbitda: 45.2, week52Low: 218.0, week52High: 299.0, revenueGrowth: '+19% YoY', grossMargin: '18.2%', nextEarnings: 'Apr 23, 2025', beta: 2.15, dividendYield: null },
  SMCI: { companyName: 'Super Micro Computer, Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Computer Hardware', marketCap: '$48B', peRatio: 28.2, evEbitda: 22.1, week52Low: 425.0, week52High: 965.0, revenueGrowth: '+88% YoY', grossMargin: '16.8%', nextEarnings: 'Apr 30, 2025', beta: 1.95, dividendYield: null },
  AVGO: { companyName: 'Broadcom Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', marketCap: '$758B', peRatio: 42.1, evEbitda: 18.5, week52Low: 125.0, week52High: 185.0, revenueGrowth: '+34% YoY', grossMargin: '59.2%', nextEarnings: 'Jun 12, 2025', beta: 1.42, dividendYield: '1.6%' },
  GOOGL: { companyName: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Content & Information', marketCap: '$2.15T', peRatio: 26.2, evEbitda: 14.1, week52Low: 155.0, week52High: 182.0, revenueGrowth: '+10% YoY', grossMargin: '57.1%', nextEarnings: 'Apr 24, 2025', beta: 1.05, dividendYield: '0.52%' },
  INTC: { companyName: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', marketCap: '$178B', peRatio: 28.5, evEbitda: 8.2, week52Low: 38.0, week52High: 52.0, revenueGrowth: '+3% YoY', grossMargin: '45.2%', nextEarnings: 'Apr 24, 2025', beta: 1.12, dividendYield: '1.6%' },
  SPY: { companyName: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', sector: 'Financial', industry: 'ETF', marketCap: 'N/A', peRatio: null, evEbitda: null, week52Low: 480.0, week52High: 525.0, revenueGrowth: null, grossMargin: null, nextEarnings: null, beta: 1.0, dividendYield: '1.3%' },
  QQQ: { companyName: 'Invesco QQQ Trust', exchange: 'NASDAQ', sector: 'Financial', industry: 'ETF', marketCap: 'N/A', peRatio: null, evEbitda: null, week52Low: 420.0, week52High: 465.0, revenueGrowth: null, grossMargin: null, nextEarnings: null, beta: 1.05, dividendYield: '0.5%' },
  JPM: { companyName: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial', industry: 'Banks', marketCap: '$570B', peRatio: 11.2, evEbitda: null, week52Low: 175.0, week52High: 205.0, revenueGrowth: '+8% YoY', grossMargin: null, nextEarnings: 'Apr 11, 2025', beta: 1.1, dividendYield: '2.2%' },
  DIS: { companyName: 'The Walt Disney Company', exchange: 'NYSE', sector: 'Consumer Cyclical', industry: 'Entertainment', marketCap: '$205B', peRatio: 22.5, evEbitda: 12.1, week52Low: 85.0, week52High: 125.0, revenueGrowth: '+4% YoY', grossMargin: '35%', nextEarnings: 'May 7, 2025', beta: 1.35, dividendYield: '0.3%' },
  NFLX: { companyName: 'Netflix, Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Entertainment', marketCap: '$212B', peRatio: 45.2, evEbitda: 28.5, week52Low: 420.0, week52High: 510.0, revenueGrowth: '+15% YoY', grossMargin: '45%', nextEarnings: 'Apr 17, 2025', beta: 1.25, dividendYield: null },
  COIN: { companyName: 'Coinbase Global, Inc.', exchange: 'NASDAQ', sector: 'Financial', industry: 'Financial Data', marketCap: '$58B', peRatio: 35.5, evEbitda: 22.1, week52Low: 180.0, week52High: 280.0, revenueGrowth: '+45% YoY', grossMargin: '82%', nextEarnings: 'May 1, 2025', beta: 2.1, dividendYield: null },
}

const now = new Date()
const minAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()

export const SIGNALS: Signal[] = [
  {
    id: 'sig-001',
    urgency: 'BREAKING',
    tickers: ['NVDA', 'AMD'],
    agent: 'Macro Pulse',
    source: 'Reuters',
    publishedAt: minAgo(2),
    relativeTime: '2m ago',
    sentiment: 'bearish',
    impactScore: 8,
    confidence: 0.92,
    category: 'Policy',
    summaryEn: 'Reuters reports tighter semiconductor export restrictions to secondary markets; NVIDIA and AMD data center GPU shipments to China may face new compliance checks in Q2.',
    summaryZh: '路透报道半导体出口限制收紧至次级市场；英伟达与AMD数据中心GPU对华出货或在Q2面临新的合规检查。',
    whyItMatters: 'Near-term revenue visibility for AI GPU vendors could be pressured if enforcement tightens, even as long-term demand remains strong.',
    reasoningSteps: [
      'Reuters reports tighter semiconductor export restrictions to secondary markets.',
      'Restrictions may weaken near-term China AI infrastructure demand.',
      'NVIDIA and AMD exposure inferred through data center GPU supply chain.',
      'Short-term sentiment impact likely negative despite strong long-term demand.',
    ],
    evidenceMeta: {
      sourceType: 'News',
      sourcePublishTime: minAgo(2),
      extractionTime: minAgo(2),
      tickerMatchingLogic: 'Entity extraction + sector mapping',
      confidence: 0.92,
      relevance: 0.95,
      relatedEvidenceCount: 3,
    },
    relatedHistory: [
      { date: '2025-02-14', summary: 'Previous export rule clarification for AI chips', similarityScore: 0.88, marketReaction: 'NVDA -2.1% next session' },
      { date: '2025-01-08', summary: 'China data center capex guidance cut', similarityScore: 0.72 },
    ],
    marketReactionHint: 'NVDA -1.2% since signal · AMD -0.4% intraday',
  },
  {
    id: 'sig-002',
    urgency: 'DIGEST',
    tickers: ['TSM'],
    agent: 'Earnings Scout',
    source: 'Company filing',
    publishedAt: minAgo(8),
    relativeTime: '8m ago',
    sentiment: 'bullish',
    impactScore: 6,
    confidence: 0.88,
    category: 'Earnings',
    summaryEn: 'TSMC raises full-year capex guidance; 3nm and CoWoS capacity expansion ahead of schedule, supporting stronger AI-related revenue mix.',
    summaryZh: '台积电上调全年资本支出指引；3nm与CoWoS产能扩张提前，支撑AI相关营收占比提升。',
    whyItMatters: 'Higher capex signals confidence in AI and advanced node demand; positive read-through for NVDA, AMD, and hyperscalers.',
    reasoningSteps: [
      'TSMC official filing updates FY capex range upward.',
      '3nm and CoWoS called out as key growth drivers.',
      'Timeline for capacity pull-in implies stronger near-term orders.',
      'Positive for fabless AI semis and cloud capex narrative.',
    ],
    evidenceMeta: {
      sourceType: 'SEC/Exchange Filing',
      sourcePublishTime: minAgo(8),
      extractionTime: minAgo(8),
      tickerMatchingLogic: 'Direct ticker in filing',
      confidence: 0.88,
      relevance: 0.9,
      relatedEvidenceCount: 2,
    },
    relatedHistory: [
      { date: '2025-02-20', summary: 'TSMC January revenue beat', similarityScore: 0.65 },
      { date: '2025-01-16', summary: 'CoWoS capacity expansion announcement', similarityScore: 0.81, marketReaction: 'NVDA +1.8%' },
    ],
    marketReactionHint: 'TSM +0.8% intraday',
  },
  {
    id: 'sig-003',
    urgency: 'FYI',
    tickers: ['NVDA', 'SMCI'],
    agent: 'Macro Pulse',
    source: 'Bloomberg',
    publishedAt: minAgo(15),
    relativeTime: '15m ago',
    sentiment: 'neutral',
    impactScore: 4,
    confidence: 0.75,
    category: 'Macro',
    summaryEn: 'Hyperscaler order patterns suggest front-loaded AI server demand in H1; SMCI and NVIDIA supply chain commentary aligned with strong Q1 shipments.',
    summaryZh: '超大规模厂商订单形态显示上半年AI服务器需求前倾；超微与英伟达供应链口径与强劲Q1出货一致。',
    whyItMatters: 'Confirms narrative of strong near-term AI infrastructure spend; watch for any order pushouts in Q2 guidance.',
    reasoningSteps: [
      'Bloomberg industry sources cite hyperscaler ordering behavior.',
      'SMCI and NVIDIA mentioned in same context for AI servers.',
      'H1 front-loading implies possible moderation in H2.',
      'Neutral for sentiment; supportive for near-term numbers.',
    ],
    evidenceMeta: {
      sourceType: 'News',
      sourcePublishTime: minAgo(15),
      extractionTime: minAgo(15),
      tickerMatchingLogic: 'Entity + sector',
      confidence: 0.75,
      relevance: 0.82,
      relatedEvidenceCount: 4,
    },
    relatedHistory: [
      { date: '2025-02-28', summary: 'Hyperscaler capex outlook', similarityScore: 0.7 },
    ],
  },
  {
    id: 'sig-004',
    urgency: 'DIGEST',
    tickers: ['BABA'],
    agent: 'Policy Watch',
    source: 'Caixin',
    publishedAt: minAgo(22),
    relativeTime: '22m ago',
    sentiment: 'bearish',
    impactScore: 5,
    confidence: 0.8,
    category: 'Policy',
    summaryEn: 'Regulatory draft on platform competition signals continued scrutiny; Alibaba and peers may face more operational constraints in domestic e-commerce.',
    summaryZh: '平台竞争监管草案释放持续收紧信号；阿里及同业在国内电商领域或面临更多经营约束。',
    whyItMatters: 'Ongoing regulatory overhang can cap multiple expansion and add execution risk for BABA and Chinese internet names.',
    reasoningSteps: [
      'Caixin reports new draft rules on platform competition.',
      'Focus on dominant players in e-commerce and digital services.',
      'BABA explicitly named in follow-up analyst coverage.',
      'Historical pattern: draft → comment → implementation over 1–2 quarters.',
    ],
    evidenceMeta: {
      sourceType: 'News',
      sourcePublishTime: minAgo(22),
      extractionTime: minAgo(22),
      tickerMatchingLogic: 'Entity extraction',
      confidence: 0.8,
      relevance: 0.88,
      relatedEvidenceCount: 2,
    },
    relatedHistory: [
      { date: '2025-02-10', summary: 'Ant Group restructuring update', similarityScore: 0.6 },
      { date: '2025-01-22', summary: 'E-commerce competition guidelines', similarityScore: 0.78 },
    ],
    marketReactionHint: 'BABA underperforming HSCEI -1.2%',
  },
  {
    id: 'sig-005',
    urgency: 'FYI',
    tickers: ['AAPL'],
    agent: 'Earnings Scout',
    source: 'Supply chain channel',
    publishedAt: minAgo(31),
    relativeTime: '31m ago',
    sentiment: 'neutral',
    impactScore: 3,
    confidence: 0.7,
    category: 'Earnings',
    summaryEn: 'iPhone build plans for next quarter largely unchanged; slight tilt toward Pro models, in line with prior commentary.',
    summaryZh: '下季度iPhone生产计划大体不变；略向Pro机型倾斜，与先前口径一致。',
    whyItMatters: 'No positive or negative surprise; supports stable revenue expectations for AAPL device segment.',
    reasoningSteps: [
      'Channel checks indicate stable iPhone build orders.',
      'Pro mix slightly higher, consistent with margin focus.',
      'No material change from last month\'s checks.',
      'Neutral for near-term estimates.',
    ],
    evidenceMeta: {
      sourceType: 'Channel',
      sourcePublishTime: minAgo(31),
      extractionTime: minAgo(31),
      tickerMatchingLogic: 'Product–ticker mapping',
      confidence: 0.7,
      relevance: 0.75,
      relatedEvidenceCount: 1,
    },
    relatedHistory: [
      { date: '2025-02-25', summary: 'iPhone China share data', similarityScore: 0.55 },
    ],
  },
  {
    id: 'sig-006',
    urgency: 'DIGEST',
    tickers: ['MSFT'],
    agent: 'Macro Pulse',
    source: 'Azure blog',
    publishedAt: minAgo(45),
    relativeTime: '45m ago',
    sentiment: 'bullish',
    impactScore: 5,
    confidence: 0.85,
    category: 'Macro',
    summaryEn: 'Azure AI capacity expansion in multiple regions; enterprise adoption metrics and new model deployments support sustained cloud growth narrative.',
    summaryZh: 'Azure在多区域扩大AI产能；企业采用指标与新模型部署支撑云业务持续增长叙事。',
    whyItMatters: 'Confirms enterprise AI spend is real and scaling; positive for MSFT and broader cloud/AI theme.',
    reasoningSteps: [
      'Official Azure blog announces capacity and region expansion.',
      'Enterprise adoption metrics cited for AI workloads.',
      'New model deployments (e.g. Copilot stack) referenced.',
      'Supports sustained double-digit Azure growth narrative.',
    ],
    evidenceMeta: {
      sourceType: 'Company',
      sourcePublishTime: minAgo(45),
      extractionTime: minAgo(45),
      tickerMatchingLogic: 'Direct (MSFT Azure)',
      confidence: 0.85,
      relevance: 0.9,
      relatedEvidenceCount: 3,
    },
    relatedHistory: [
      { date: '2025-02-18', summary: 'Azure quarter revenue beat', similarityScore: 0.72 },
      { date: '2025-01-30', summary: 'Copilot for Office rollout', similarityScore: 0.68 },
    ],
  },
  {
    id: 'sig-007',
    urgency: 'FYI',
    tickers: ['META'],
    agent: 'Earnings Scout',
    source: 'Ad industry report',
    publishedAt: minAgo(52),
    relativeTime: '52m ago',
    sentiment: 'bullish',
    impactScore: 4,
    confidence: 0.72,
    category: 'Earnings',
    summaryEn: 'Digital ad spend recovery in key verticals continues; Meta and Google capture disproportionate share of performance budgets.',
    summaryZh: '关键垂直领域数字广告支出复苏延续；Meta与谷歌在效果广告预算中占比提升。',
    whyItMatters: 'Supports revenue re-acceleration thesis for META; monitor for any brand budget cuts in Q2.',
    reasoningSteps: [
      'Industry report cites ad spend data by vertical and platform.',
      'Performance (direct response) growing faster than brand.',
      'META and Google named as primary beneficiaries.',
      'Re-acceleration narrative intact for now.',
    ],
    evidenceMeta: {
      sourceType: 'Research',
      sourcePublishTime: minAgo(52),
      extractionTime: minAgo(52),
      tickerMatchingLogic: 'Entity extraction',
      confidence: 0.72,
      relevance: 0.8,
      relatedEvidenceCount: 2,
    },
    relatedHistory: [
      { date: '2025-02-12', summary: 'Meta Q4 ad load and pricing', similarityScore: 0.65 },
    ],
  },
  {
    id: 'sig-008',
    urgency: 'BREAKING',
    tickers: ['BABA'],
    agent: 'Policy Watch',
    source: 'State Council',
    publishedAt: minAgo(65),
    relativeTime: '1h ago',
    sentiment: 'bearish',
    impactScore: 7,
    confidence: 0.9,
    category: 'Policy',
    summaryEn: 'State Council document outlines new data and algorithm governance requirements for large platforms; compliance timeline within 12 months.',
    summaryZh: '国务院文件明确大型平台数据与算法治理新要求；合规时间表为12个月内。',
    whyItMatters: 'Adds regulatory and compliance cost overhang; may pressure margins and limit certain product rollouts for BABA and peers.',
    reasoningSteps: [
      'State Council published draft implementation rules.',
      'Data and algorithm governance apply to large platforms.',
      'BABA, Tencent, JD.com typically in scope.',
      '12-month compliance window implies 2025–2026 impact.',
    ],
    evidenceMeta: {
      sourceType: 'Official',
      sourcePublishTime: minAgo(65),
      extractionTime: minAgo(65),
      tickerMatchingLogic: 'Sector + entity list',
      confidence: 0.9,
      relevance: 0.92,
      relatedEvidenceCount: 5,
    },
    relatedHistory: [
      { date: '2025-02-01', summary: 'Data security law implementation', similarityScore: 0.85, marketReaction: 'BABA -3.2%' },
      { date: '2024-12-15', summary: 'Algorithm disclosure rules', similarityScore: 0.7 },
    ],
  },
  {
    id: 'sig-009',
    urgency: 'DIGEST',
    tickers: ['TSLA'],
    agent: 'Macro Pulse',
    source: 'EV registration data',
    publishedAt: minAgo(78),
    relativeTime: '1h ago',
    sentiment: 'neutral',
    impactScore: 4,
    confidence: 0.78,
    category: 'Earnings',
    summaryEn: 'February EV registration data in key markets mixed; Tesla share stable in US, slight pressure in China from local OEMs.',
    summaryZh: '二月主要市场电动车注册数据好坏参半；特斯拉在美份额稳定，在华受本土车企挤压。',
    whyItMatters: 'Delivery estimates for Q1 remain in focus; China mix and pricing are key variables for TSLA margins.',
    reasoningSteps: [
      'Third-party registration data for US, China, EU released.',
      'Tesla US share stable; China share down slightly.',
      'Local OEMs (BYD, NIO, etc.) gaining in China.',
      'Neutral for delivery range; margin pressure if mix shifts.',
    ],
    evidenceMeta: {
      sourceType: 'Data',
      sourcePublishTime: minAgo(78),
      extractionTime: minAgo(78),
      tickerMatchingLogic: 'Ticker in dataset',
      confidence: 0.78,
      relevance: 0.85,
      relatedEvidenceCount: 2,
    },
    relatedHistory: [
      { date: '2025-02-05', summary: 'Tesla January China registrations', similarityScore: 0.82 },
    ],
  },
  {
    id: 'sig-010',
    urgency: 'FYI',
    tickers: ['AVGO'],
    agent: 'Earnings Scout',
    source: 'Industry digest',
    publishedAt: minAgo(90),
    relativeTime: '1h ago',
    sentiment: 'neutral',
    impactScore: 3,
    confidence: 0.68,
    category: 'Earnings',
    summaryEn: 'Broadcom VMware integration on track; networking and custom silicon backlog supports visibility into FY25.',
    summaryZh: '博通VMware整合按计划推进；网络与定制硅订单支撑FY25能见度。',
    whyItMatters: 'Stable execution narrative for AVGO; semiconductor and software mix key for multiple.',
    reasoningSteps: [
      'Company and industry sources indicate integration on track.',
      'Networking and custom silicon segments cited as strong.',
      'Backlog provides revenue visibility.',
      'Neutral; no major surprise.',
    ],
    evidenceMeta: {
      sourceType: 'News',
      sourcePublishTime: minAgo(90),
      extractionTime: minAgo(90),
      tickerMatchingLogic: 'Entity',
      confidence: 0.68,
      relevance: 0.72,
      relatedEvidenceCount: 1,
    },
    relatedHistory: [
      { date: '2025-02-15', summary: 'AVGO Q1 earnings beat', similarityScore: 0.6 },
    ],
  },
]

export const RAG_MOCK: RAGResult = {
  query: 'Why did NVDA weaken last month despite strong AI demand?',
  answerSummary: 'NVDA shares weakened in February primarily due to (1) renewed concerns over U.S.–China semiconductor export rules and potential compliance checks on data center GPU shipments, (2) profit-taking after a strong January rally, and (3) mixed hyperscaler order commentary that suggested some front-loading of H1 demand. Strong structural AI demand remained intact, but near-term sentiment was pressured by policy and positioning.',
  answerSummaryZh: '英伟达股价在二月走弱主要因为：(1) 美中半导体出口规则再度引发担忧，数据中心GPU对华出货或面临合规检查；(2) 一月大涨后的获利了结；(3) 超大规模厂商订单评论好坏参半，暗示上半年需求前倾。结构性AI需求仍然强劲，但政策与仓位压制短期情绪。',
  timeRange: 'Feb 1 – Mar 1, 2025',
  tickersInvolved: ['NVDA', 'AMD', 'TSM'],
  supportingSignals: [
    { signalId: 'sig-001', summary: 'Reuters: tighter semiconductor export restrictions; NVIDIA and AMD GPU shipments to China may face new compliance checks in Q2.', date: '2025-03-08', source: 'Reuters', ticker: 'NVDA', relevance: 0.95, whyMatched: 'Direct mention of NVDA and export restrictions; semantic match to "weaken despite AI demand" (policy headwind).' },
    { signalId: 'sig-003', summary: 'Hyperscaler order patterns suggest front-loaded AI server demand in H1; watch for order pushouts in Q2 guidance.', date: '2025-03-08', source: 'Bloomberg', ticker: 'NVDA', relevance: 0.82, whyMatched: 'Explains demand timing and order pushouts that contributed to near-term weakness; matches "strong AI demand" vs short-term pressure.' },
    { signalId: 'sig-002', summary: 'TSMC raises capex; 3nm and CoWoS capacity ahead of schedule. Positive read-through for NVDA and AMD.', date: '2025-03-08', source: 'Company filing', ticker: 'TSM', relevance: 0.78, whyMatched: 'Supply chain context for NVDA; CoWoS is key for NVDA GPUs; supports "AI demand" narrative while timeframe aligns with "last month".' },
  ],
}
