import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { getLatestAnalysis, getWatchlist } from "@/lib/api";
import { AnalysisView } from "@/components/AnalysisView";
import { AnalysisPending } from "@/components/AnalysisPending";
import { DeleteStockButton } from "@/components/DeleteStockButton";
import type { Approach } from "@/types/spec";

export default async function StockDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ approach?: string }>;
}) {
  const { ticker } = await params;
  const { approach: approachParam } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection middleware should already guarantee this, but guard
  // defensively rather than assume — this page reads user.id below.
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-gray-500">
          Please sign in to view this stock.
        </p>
      </main>
    );
  }

  // Prefer an explicit ?approach= query param (e.g. linked from the
  // dashboard, which already knows each ticker's approach). Fall back to
  // checking the user's watchlist entry for this ticker, and finally to
  // "long_term" if neither is available — this last default is an
  // assumption, not a spec-confirmed behavior.
  let approach: Approach = (approachParam as Approach) ?? "long_term";
  if (!approachParam) {
    try {
      const watchlist = await getWatchlist();
      const entry = watchlist.find(
        (w) => w.ticker.toUpperCase() === ticker.toUpperCase()
      );
      if (entry) approach = entry.approach;
    } catch {
      // Non-fatal — fall back to the long_term default above.
    }
  }

  const existing = await getLatestAnalysis(ticker, approach);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
        >
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          Back to dashboard
        </Link>
        <DeleteStockButton userId={user.id} ticker={ticker} />
      </div>

      {existing ? (
        <AnalysisView analysis={existing} />
      ) : (
        <AnalysisPending userId={user.id} ticker={ticker} approach={approach} />
      )}
    </main>
  );
}