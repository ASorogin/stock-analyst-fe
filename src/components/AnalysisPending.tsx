"use client";

import { useEffect, useRef, useState } from "react";
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
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function start() {
      try {
        const { request_id } = await requestAnalysis(userId, ticker, approach);

        intervalId = setInterval(async () => {
          if (cancelled) return;
          attemptsRef.current += 1;

          try {
            const poll = await pollAnalysis(request_id);

            if (poll.status === "completed" && poll.result) {
              clearInterval(intervalId);
              if (!cancelled) setAnalysis(poll.result);
            } else if (poll.status === "error") {
              clearInterval(intervalId);
              if (!cancelled) {
                setError(poll.error ?? "Analysis failed. Please try again.");
              }
            } else if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
              clearInterval(intervalId);
              if (!cancelled) {
                setError("This is taking longer than expected. Please refresh in a bit.");
              }
            }
          } catch {
            clearInterval(intervalId);
            if (!cancelled) setError("Lost connection while checking analysis status.");
          }
        }, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setError("Couldn't start the analysis. Please try again.");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [userId, ticker, approach]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (analysis) {
    return <AnalysisView analysis={analysis} />;
  }

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-500">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <p className="text-sm">Analyzing {ticker.toUpperCase()}\u2026 this usually takes 10\u201315 seconds.</p>
    </div>
  );
}