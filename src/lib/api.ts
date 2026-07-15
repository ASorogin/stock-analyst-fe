import type {
  AnalysisResponse,
  WatchlistSummary,
  NewsUpdatePush,
  Approach,
} from "@/types/spec";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function getWatchlist(userId?: string): Promise<WatchlistSummary[]> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  const res = await fetch(`${BACKEND_URL}/api/watchlist${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load watchlist (${res.status})`);
  return res.json();
}

export interface AddToWatchlistResult {
  ticker: string;
  approach: Approach;
  request_id: string;
  status: "pending";
}

/**
 * Adds a ticker to the user's watchlist and triggers its first analysis
 * (Flow 1). Throws with a user-facing message on the free-tier 402, so
 * callers can show it directly rather than a generic error.
 */
export async function addToWatchlist(
  userId: string,
  ticker: string,
  approach: Approach
): Promise<AddToWatchlistResult> {
  const res = await fetch(`${BACKEND_URL}/api/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ticker, approach }),
  });

  if (res.status === 402) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Free plan limit reached.");
  }
  if (!res.ok) throw new Error(`Failed to add stock (${res.status})`);
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

/**
 * Looks up the most recent *completed* analysis for a ticker directly,
 * without needing a request_id — backs the Stock Detail page when a user
 * revisits a ticker already on their watchlist. Returns null (not an
 * error) when nothing's been analyzed yet, so callers can fall back to
 * triggering a fresh requestAnalysis().
 */
export async function getLatestAnalysis(
  ticker: string,
  approach?: Approach
): Promise<AnalysisResponse | null> {
  const query = approach ? `?approach=${approach}` : "";
  const res = await fetch(`${BACKEND_URL}/api/analysis/latest/${ticker}${query}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load latest analysis (${res.status})`);
  return res.json();
}

export async function getNews(ticker: string): Promise<NewsUpdatePush | null> {
  const res = await fetch(`${BACKEND_URL}/api/news/${ticker}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load news (${res.status})`);
  return res.json();
}