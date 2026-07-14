/**
 * Types generated from stock-analyst-app-io-spec.md (v0.1) — the locked contract
 * between this app and Yarin's n8n workflow.
 *
 * DO NOT add, rename, or restructure fields here without confirming with Yarin first.
 * If the app needs something not covered by this file, that means the spec is missing
 * something — flag it, don't quietly extend this file.
 *
 * ASSUMPTIONS (spec examples didn't exhaustively enumerate these — confirm with Yarin):
 *   - NewsItem.sentiment: inferred "positive" | "negative" | "neutral" (mirrors key_points)
 *   - NewsItem.impact_level: inferred "low" | "medium" | "high" (mirrors risk_level)
 *   - TechnicalSnapshot.trend: inferred "uptrend" | "downtrend" | "sideways"
 *     (only "uptrend" appears in the spec's example)
 *   - NewsUpdatePush.event_type: only "news_update" appears in the spec; kept as a
 *     literal in case other event types get added later
 */

// ---- Shared enums / literals ----

export type Approach = "long_term" | "short_term";
export type Verdict = "buy" | "hold" | "sell";
export type RiskLevel = "low" | "medium" | "high";
export type KeyPointType = "positive" | "negative" | "neutral";

/** ASSUMPTION — not exhaustively confirmed by the spec, see file header. */
export type NewsSentiment = "positive" | "negative" | "neutral";
/** ASSUMPTION — not exhaustively confirmed by the spec, see file header. */
export type ImpactLevel = "low" | "medium" | "high";
/** ASSUMPTION — not exhaustively confirmed by the spec, see file header. */
export type Trend = "uptrend" | "downtrend" | "sideways";

// ---- Flow 1: Initial Stock Analysis ----

/** App/Backend -> n8n */
export interface AnalysisRequest {
  request_id: string;
  user_id: string;
  ticker: string;
  approach: Approach;
  requested_at: string; // ISO 8601
}

export interface AnalystConsensus {
  buy_pct: number;
  hold_pct: number;
  sell_pct: number;
  num_analysts: number;
}

export interface Rating {
  verdict: Verdict;
  confidence_score: number; // 0-100
  analyst_consensus: AnalystConsensus;
}

export interface PriceData {
  current_price: number;
  currency: string;
  day_change_pct: number;
  target_price_low: number;
  target_price_avg: number;
  target_price_high: number;
  week52_low: number;
  week52_high: number;
}

export interface KeyPoint {
  type: KeyPointType;
  text: string;
}

export interface Fundamentals {
  market_cap: string;
  pe_ratio: number;
  dividend_yield: number;
  eps: number;
  revenue_growth_yoy: number;
}

export interface TechnicalSnapshot {
  trend: Trend;
  rsi: number;
  moving_avg_50: number;
  moving_avg_200: number;
}

export interface EntryPriceRange {
  low: number;
  high: number;
}

export interface SuggestedAction {
  entry_price_range: EntryPriceRange;
  timeframe: string;
  position_sizing_note: string;
}

/** n8n -> Backend -> App: full analysis for the Stock Detail page */
export interface AnalysisResponse {
  request_id: string;
  ticker: string;
  company_name: string;
  approach: Approach;
  generated_at: string; // ISO 8601
  rating: Rating;
  price_data: PriceData;
  risk_level: RiskLevel;
  summary: string;
  key_points: KeyPoint[];
  fundamentals: Fundamentals;
  technical_snapshot: TechnicalSnapshot;
  suggested_action: SuggestedAction;
}

// ---- Flow 2: Watchlist News Updates ----

export interface NewsItem {
  news_id: string;
  headline: string;
  source: string;
  published_at: string; // ISO 8601
  sentiment: NewsSentiment;
  impact_level: ImpactLevel;
  summary: string;
  url: string;
}

/** Optional partial rating update carried on a news push */
export interface UpdatedRating {
  verdict: Verdict;
  confidence_score: number;
}

/** n8n -> Backend webhook, one event per ticker with news */
export interface NewsUpdatePush {
  event_type: "news_update";
  ticker: string;
  generated_at: string; // ISO 8601
  news_items: NewsItem[];
  /** Optional — only present if news is significant enough to shift the rating */
  updated_rating?: UpdatedRating;
}

/** Backend -> App: lightweight per-ticker summary for the Dashboard list view */
export interface WatchlistSummary {
  ticker: string;
  company_name: string;
  verdict: Verdict;
  confidence_score: number;
  current_price: number;
  day_change_pct: number;
  approach: Approach;
  latest_headline: string;
  unread_news_count: number;
  last_updated: string; // ISO 8601
}