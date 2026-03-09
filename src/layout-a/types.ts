export type SentimentBias = 'bullish' | 'bearish' | 'neutral'

export interface WatchlistTicker {
  symbol: string
  companyName: string
  market: string
  sector: string
  signalCountToday: number
  lastSignalAt: string
  sentimentBias: SentimentBias
  hasBreaking: boolean
  currentPrice?: number
  dailyChangePercent?: number
}

export interface MarketIndex {
  name: string
  symbol: string
  value: number
  changePercent: number
  trend: number[]
}

export interface StockPriceData {
  currentPrice: number
  dailyChange: number
  dailyChangePercent: number
  trend1D: number[]
  trend5D: number[]
  trend1M: number[]
  volume?: number
  relativeStrengthLabel?: string
}

export interface CompanyFundamentals {
  companyName: string
  exchange: string
  sector: string
  industry: string
  marketCap: string
  peRatio: number | null
  evEbitda: number | null
  week52Low: number
  week52High: number
  revenueGrowth: string | null
  grossMargin: string | null
  nextEarnings: string | null
  beta: number | null
  dividendYield?: string | null
}

export interface WatchlistSummary {
  name: string
  trackedCount: number
  signalsToday: number
  breakingCount: number
  bullishRatio: number
  mostActiveAgent: string
}

export type Urgency = 'BREAKING' | 'DIGEST' | 'FYI'

export interface EvidenceMeta {
  sourceType: string
  sourcePublishTime: string
  extractionTime: string
  tickerMatchingLogic: string
  confidence: number
  relevance: number
  relatedEvidenceCount: number
}

export interface RelatedHistoryItem {
  date: string
  summary: string
  similarityScore: number
  marketReaction?: string
}

export interface Signal {
  id: string
  urgency: Urgency
  tickers: string[]
  agent: string
  source: string
  publishedAt: string
  relativeTime: string
  sentiment: SentimentBias
  impactScore: number
  confidence: number
  category: string
  summaryEn: string
  summaryZh: string
  whyItMatters: string
  reasoningSteps: string[]
  evidenceMeta: EvidenceMeta
  relatedHistory: RelatedHistoryItem[]
  marketReactionHint?: string
}

export interface RAGEvidenceCard {
  signalId: string
  summary: string
  date: string
  source: string
  ticker: string
  relevance: number
}

export interface RAGResult {
  query: string
  answerSummary: string
  answerSummaryZh: string
  timeRange: string
  supportingSignals: RAGEvidenceCard[]
}

export type FilterChipId = 'all' | 'breaking' | 'bullish' | 'bearish' | 'macro' | 'earnings' | 'policy'
