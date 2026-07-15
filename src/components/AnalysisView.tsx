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
  negative: "\u2212",
  neutral: "\u2022",
};

export function AnalysisView({ analysis }: { analysis: AnalysisResponse }) {
  const { rating, price_data, suggested_action } = analysis;
  const dayChangeUp = price_data.day_change_pct >= 0;

  return (
    <div className="space-y-6">
      {/* Header: company name, verdict badge, price */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{analysis.company_name}</h1>
          <p className="text-sm text-gray-500">{analysis.ticker}</p>
        </div>
        <span
          className={`rounded-full border px-4 py-1 text-sm font-medium uppercase ${VERDICT_STYLES[rating.verdict]}`}
        >
          {rating.verdict}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold">
          {price_data.currency} {price_data.current_price.toFixed(2)}
        </span>
        <span className={dayChangeUp ? "text-green-600" : "text-red-600"}>
          {dayChangeUp ? "\u25B2" : "\u25BC"} {Math.abs(price_data.day_change_pct)}%
        </span>
        <span
          className={`ml-2 rounded-full px-3 py-0.5 text-xs font-medium ${RISK_STYLES[analysis.risk_level]}`}
        >
          {analysis.risk_level} risk
        </span>
      </div>

      {/* Confidence gauge */}
      <div>
        <div className="mb-1 flex justify-between text-sm text-gray-600">
          <span>Confidence score</span>
          <span>{rating.confidence_score}/100</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{ width: `${rating.confidence_score}%` }}
          />
        </div>
      </div>

      {/* Analyst consensus stacked bar */}
      <div>
        <div className="mb-1 text-sm text-gray-600">
          Analyst consensus ({rating.analyst_consensus.num_analysts} analysts)
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full text-[10px] text-white">
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

      {/* Price target range */}
      <div className="rounded-lg border p-4 text-sm">
        <div className="mb-1 text-gray-600">Price targets</div>
        <div className="flex justify-between">
          <span>Low: {price_data.target_price_low}</span>
          <span className="font-medium">Avg: {price_data.target_price_avg}</span>
          <span>High: {price_data.target_price_high}</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          52-week range: {price_data.week52_low} \u2013 {price_data.week52_high}
        </div>
      </div>

      {/* Summary hero card */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed">
        {analysis.summary}
      </div>

      {/* Pros/cons key points */}
      <ul className="space-y-1 text-sm">
        {analysis.key_points.map((point, i) => (
          <li key={i} className={KEY_POINT_STYLES[point.type]}>
            <span className="mr-2 font-bold">{KEY_POINT_ICON[point.type]}</span>
            {point.text}
          </li>
        ))}
      </ul>

      {/* Fundamentals stat grid */}
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

      {/* Technical snapshot */}
      <div className="rounded-lg border p-4 text-sm">
        <div className="mb-2 text-gray-600">Technical snapshot</div>
        <div className="flex flex-wrap gap-4">
          <span>Trend: {analysis.technical_snapshot.trend}</span>
          <span>RSI: {analysis.technical_snapshot.rsi}</span>
          <span>50-day MA: {analysis.technical_snapshot.moving_avg_50}</span>
          <span>200-day MA: {analysis.technical_snapshot.moving_avg_200}</span>
        </div>
      </div>

      {/* Suggested action callout */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-sm">
        <div className="mb-1 font-medium text-blue-900">Suggested action</div>
        <div>
          Entry range: {suggested_action.entry_price_range.low} \u2013{" "}
          {suggested_action.entry_price_range.high}
        </div>
        <div>Timeframe: {suggested_action.timeframe}</div>
        <div className="mt-1 text-blue-800">{suggested_action.position_sizing_note}</div>
      </div>

      <p className="text-xs text-gray-400">
        Analysis generated {new Date(analysis.generated_at).toLocaleString()}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}