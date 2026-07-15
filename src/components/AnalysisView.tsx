import type { AnalysisResponse } from "@/types/spec";

const VERDICT_STYLES: Record<AnalysisResponse["rating"]["verdict"], string> = {
  buy: "bg-green-100 text-green-800 border-green-300",
  hold: "bg-amber-100 text-amber-800 border-amber-300",
  sell: "bg-red-100 text-red-800 border-red-300",
};

const RISK_STYLES: Record<AnalysisResponse["risk_level"], string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

const KEY_POINT_STYLES: Record<string, string> = {
  positive: "text-green-700",
  negative: "text-red-700",
  neutral: "text-gray-600",
};

const KEY_POINT_ICON: Record<string, string> = {
  positive: "+",
  negative: "−",
  neutral: "•",
};

const TREND_ICON: Record<string, string> = {
  uptrend: "▲",
  downtrend: "▼",
  sideways: "→",
};

const TREND_COLOR: Record<string, string> = {
  uptrend: "text-green-600",
  downtrend: "text-red-600",
  sideways: "text-gray-500",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

export function AnalysisView({ analysis }: { analysis: AnalysisResponse }) {
  const { rating, price_data, suggested_action } = analysis;
  const dayChangeUp = price_data.day_change_pct >= 0;
  const trend = analysis.technical_snapshot.trend;

  return (
    <div className="space-y-8">
      {/* Header: company name, verdict badge, price */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{analysis.company_name}</h1>
            <p className="text-sm text-gray-500">{analysis.ticker}</p>
          </div>
          <span
            className={`rounded-full border px-4 py-1 text-sm font-semibold uppercase tracking-wide ${VERDICT_STYLES[rating.verdict]}`}
          >
            {rating.verdict}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-semibold tabular-nums text-gray-900">
            {price_data.currency} {price_data.current_price.toFixed(2)}
          </span>
          <span
            className={`font-medium tabular-nums ${dayChangeUp ? "text-green-600" : "text-red-600"}`}
          >
            {dayChangeUp ? "▲" : "▼"} {Math.abs(price_data.day_change_pct)}%
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-medium ${RISK_STYLES[analysis.risk_level]}`}
          >
            {analysis.risk_level} risk
          </span>
        </div>
      </div>

      {/* Confidence + consensus */}
      <div className="space-y-5 rounded-xl border border-gray-200 p-5">
        <div>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-gray-500">Confidence score</span>
            <span className="font-medium tabular-nums text-gray-900">
              {rating.confidence_score}/100
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${rating.confidence_score}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-sm text-gray-500">
            Analyst consensus · {rating.analyst_consensus.num_analysts} analysts
          </div>
          <div className="flex h-4 w-full overflow-hidden rounded-full text-[10px] font-medium text-white">
            <div
              className="flex items-center justify-center bg-green-600"
              style={{ width: `${rating.analyst_consensus.buy_pct}%` }}
            >
              {rating.analyst_consensus.buy_pct > 10 && `${rating.analyst_consensus.buy_pct}%`}
            </div>
            <div
              className="flex items-center justify-center bg-amber-500"
              style={{ width: `${rating.analyst_consensus.hold_pct}%` }}
            >
              {rating.analyst_consensus.hold_pct > 10 && `${rating.analyst_consensus.hold_pct}%`}
            </div>
            <div
              className="flex items-center justify-center bg-red-600"
              style={{ width: `${rating.analyst_consensus.sell_pct}%` }}
            >
              {rating.analyst_consensus.sell_pct > 10 && `${rating.analyst_consensus.sell_pct}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Summary hero card */}
      <div className="rounded-xl bg-blue-50/60 p-5 text-[15px] leading-relaxed text-gray-800">
        {analysis.summary}
      </div>

      {/* Pros/cons key points */}
      <div>
        <SectionLabel>Key points</SectionLabel>
        <ul className="space-y-2 rounded-xl border border-gray-200 p-5 text-sm">
          {analysis.key_points.map((point, i) => (
            <li key={i} className={`flex gap-2.5 ${KEY_POINT_STYLES[point.type]}`}>
              <span className="w-3 shrink-0 font-bold">{KEY_POINT_ICON[point.type]}</span>
              <span className="text-gray-700">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price targets */}
      <div>
        <SectionLabel>Price targets</SectionLabel>
        <div className="rounded-xl border border-gray-200 p-5 text-sm">
          <div className="flex justify-between tabular-nums">
            <span className="text-gray-500">Low: {price_data.target_price_low}</span>
            <span className="font-semibold text-gray-900">
              Avg: {price_data.target_price_avg}
            </span>
            <span className="text-gray-500">High: {price_data.target_price_high}</span>
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3 text-xs tabular-nums text-gray-400">
            52-week range: {price_data.week52_low} – {price_data.week52_high}
          </div>
        </div>
      </div>

      {/* Fundamentals stat grid */}
      <div>
        <SectionLabel>Fundamentals</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Market cap" value={analysis.fundamentals.market_cap} />
          <Stat label="P/E ratio" value={analysis.fundamentals.pe_ratio.toString()} />
          <Stat label="Dividend yield" value={`${analysis.fundamentals.dividend_yield}%`} />
          <Stat label="EPS" value={analysis.fundamentals.eps.toString()} />
          <Stat
            label="Revenue growth YoY"
            value={`${analysis.fundamentals.revenue_growth_yoy}%`}
          />
        </div>
      </div>

      {/* Technical snapshot */}
      <div>
        <SectionLabel>Technical snapshot</SectionLabel>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-200 p-5 text-sm">
          <span className={`flex items-center gap-1.5 font-medium ${TREND_COLOR[trend]}`}>
            {TREND_ICON[trend] ?? "→"} {trend}
          </span>
          <span className="tabular-nums text-gray-600">RSI: {analysis.technical_snapshot.rsi}</span>
          <span className="tabular-nums text-gray-600">
            50-day MA: {analysis.technical_snapshot.moving_avg_50}
          </span>
          <span className="tabular-nums text-gray-600">
            200-day MA: {analysis.technical_snapshot.moving_avg_200}
          </span>
        </div>
      </div>

      {/* Suggested action callout */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 text-sm">
        <div className="mb-2 font-semibold text-blue-900">Suggested action</div>
        <div className="space-y-1 text-blue-900">
          <div className="tabular-nums">
            Entry range: {suggested_action.entry_price_range.low} –{" "}
            {suggested_action.entry_price_range.high}
          </div>
          <div>Timeframe: {suggested_action.timeframe}</div>
        </div>
        <div className="mt-2 text-blue-800">{suggested_action.position_sizing_note}</div>
      </div>

      <p className="text-xs text-gray-400">
        Analysis generated {new Date(analysis.generated_at).toLocaleString()}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-gray-900">{value}</div>
    </div>
  );
}