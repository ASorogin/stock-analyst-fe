"use client";

import { useEffect, useState } from "react";
import type { AnalysisResponse, Approach } from "@/types/spec";
import { requestAnalysis, pollAnalysis } from "@/lib/api";
import { AnalysisView } from "./AnalysisView";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 30; // ~75s ceiling before giving up

interface Props {
  userId: string;
  ticker: string;
  approach: Approach;
}

export function AnalysisPending({ userId, ticker, approach }: Props) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function poll(requestId: string) {
      if (cancelled) return;
      attempts += 1;
      setAttempt(attempts);

      try {
        const result = await pollAnalysis(requestId);
        if (cancelled) return;

        if (result.status === "completed" && result.result) {
          setAnalysis(result.result);
        } else if (result.status === "error") {
          setError(result.error ?? "Analysis failed. Please try again.");
        } else if (attempts >= MAX_POLL_ATTEMPTS) {
          setError("This is taking longer than expected. Please try again.");
        } else {
          // Chain the next poll only after this one resolves, instead of
          // a fixed setInterval — avoids overlapping requests if a poll
          // is slower than POLL_INTERVAL_MS.
          timeoutId = setTimeout(() => poll(requestId), POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError("Lost connection while checking analysis status.");
      }
    }

    async function start() {
      try {
        const { request_id } = await requestAnalysis(userId, ticker, approach);
        if (!cancelled) {
          timeoutId = setTimeout(() => poll(request_id), POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError("Couldn't start the analysis. Please try again.");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // retryKey has no meaning of its own — bumping it just forces this
    // effect to re-run for the "Try again" button.
  }, [userId, ticker, approach, retryKey]);

  function handleRetry() {
    setError(null);
    setAnalysis(null);
    setAttempt(0);
    setRetryKey((k) => k + 1);
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-3 rounded-md border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          Try again
        </button>
      </div>
    );
  }

  if (analysis) {
    return <AnalysisView analysis={analysis} />;
  }

  const elapsedSeconds = Math.round(attempt * (POLL_INTERVAL_MS / 1000));
  const statusMessage =
    elapsedSeconds < 15
      ? "This usually takes 10–15 seconds."
      : elapsedSeconds < 45
        ? "Still working — should just be a little longer."
        : "This is taking longer than usual, but we're still on it.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 py-16 text-center"
    >
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      <p className="text-sm font-medium text-gray-700">
        Analyzing {ticker.toUpperCase()}…
      </p>
      <p className="text-xs text-gray-400">{statusMessage}</p>
    </div>
  );
}