import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWatchlist } from "@/lib/api";

const verdictStyles: Record<string, string> = {
  buy: "bg-green-100 text-green-800",
  hold: "bg-amber-100 text-amber-800",
  sell: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stocks = await getWatchlist(user?.id);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Stocks</h1>
        <Link
          href="/add-stock"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add stock
        </Link>
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => (
          <Link
            key={stock.ticker}
            href={`/stock/${stock.ticker}?approach=${stock.approach}`}
            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition hover:bg-gray-50"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stock.ticker}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${verdictStyles[stock.verdict]}`}
                >
                  {stock.verdict.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">{stock.company_name}</p>
              <p className="mt-1 text-sm text-gray-600">{stock.latest_headline}</p>
            </div>
            <div className="text-right">
              <div className="font-medium">${stock.current_price.toFixed(2)}</div>
              <div
                className={
                  stock.day_change_pct >= 0 ? "text-sm text-green-600" : "text-sm text-red-600"
                }
              >
                {stock.day_change_pct >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(stock.day_change_pct)}%
              </div>
            </div>
          </Link>
        ))}

        {stocks.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            No stocks yet — add one to get started.
          </p>
        )}
      </div>
    </main>
  );
}