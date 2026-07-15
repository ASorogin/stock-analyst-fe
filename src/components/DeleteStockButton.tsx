"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeFromWatchlist } from "@/lib/api";

export function DeleteStockButton({
  userId,
  ticker,
}: {
  userId: string;
  ticker: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await removeFromWatchlist(userId, ticker);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove this stock.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">Remove {ticker} from your watchlist?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Removing…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-500 hover:bg-gray-50"
        >
          Cancel
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      Remove from watchlist
    </button>
  );
}