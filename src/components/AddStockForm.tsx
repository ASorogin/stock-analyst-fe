"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Approach } from "@/types/spec";
import { addToWatchlist } from "@/lib/api";

export function AddStockForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [approach, setApproach] = useState<Approach>("long_term");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = ticker.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      await addToWatchlist(userId, trimmed, approach);
      router.push(`/stock/${trimmed}?approach=${approach}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="ticker" className="mb-1 block text-sm font-medium text-gray-700">
          Ticker symbol
        </label>
        <input
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="AAPL"
          maxLength={10}
          autoCapitalize="characters"
          className="w-full rounded-md border px-3 py-2 uppercase tracking-wide"
        />
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-gray-700">Approach</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="approach"
              checked={approach === "long_term"}
              onChange={() => setApproach("long_term")}
            />
            Long-term
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="approach"
              checked={approach === "short_term"}
              onChange={() => setApproach("short_term")}
            />
            Short-term
          </label>
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !ticker.trim()}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Adding\u2026" : "Add stock"}
      </button>
    </form>
  );
}