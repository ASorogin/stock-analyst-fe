import type {
  AnalysisResponse,
  WatchlistSummary,
  NewsUpdatePush,
  Approach,
} from "@/types/spec";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function getWatchlist(): Promise<WatchlistSummary[]> {
  const res = await fetch(`${BACKEND_URL}/api/watchlist`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load watchlist (${res.status})`);
  return res.json();
}

export interface RequestAnalysisResult {
  request_id: string;
  status: "pending" | "completed" | "error";
}

export async function requestAnalysis(
  userId: string,
  ticker: string,
  approach: Approach
): Promise<RequestAnalysisResult> {
  const res = await fetch(`${BACKEND_URL}/api/analysis/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ticker, approach }),
  });
  if (!res.ok) throw new Error(`Failed to request analysis (${res.status})`);
  return res.json();
}

export interface PollAnalysisResult {
  request_id: string;
  status: "pending" | "completed" | "error";
  result?: AnalysisResponse;
  error?: string;
}

export async function pollAnalysis(requestId: string): Promise<PollAnalysisResult> {
  const res = await fetch(`${BACKEND_URL}/api/analysis/${requestId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to poll analysis (${res.status})`);
  return res.json();
}

export async function getNews(ticker: string): Promise<NewsUpdatePush | null> {
  const res = await fetch(`${BACKEND_URL}/api/news/${ticker}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load news (${res.status})`);
  return res.json();
}