import { getWatchlist } from "@/lib/api";

const verdictStyles: Record<string, string> = {
  buy: "bg-green-100 text-green-800",
  hold: "bg-amber-100 text-amber-800",
  sell: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  const stocks = await getWatchlist();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Your Stocks</h1>

      <div className="space-y-3">
        {stocks.map((stock) => (
          <div
            key={stock.ticker}
            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
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
                {stock.day_change_pct >= 0 ? "▲" : "▼"} {Math.abs(stock.day_change_pct)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}