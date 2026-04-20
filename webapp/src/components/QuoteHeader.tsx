import { fmt } from "./format";

export type QuoteData = {
  name?: string;
  last_price?: number;
  prev_close?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  volume_average?: number;
  year_high?: number;
  year_low?: number;
  currency?: string;
};

export function QuoteHeader({ symbol, quote }: { symbol: string; quote?: QuoteData }) {
  const change = quote?.last_price != null && quote.prev_close != null ? quote.last_price - quote.prev_close : undefined;
  const changePct = change != null && quote?.prev_close ? change / quote.prev_close : undefined;
  const up = (change ?? 0) >= 0;

  return (
    <header className="space-y-3">
      <div className="flex items-baseline gap-4">
        <h1 className="text-3xl font-mono font-bold">{symbol.toUpperCase()}</h1>
        {quote?.name && <span className="text-muted">{quote.name}</span>}
        <div className="ml-auto flex items-baseline gap-3">
          {quote?.last_price != null && <span className="text-3xl font-semibold">{quote.last_price.toFixed(2)}</span>}
          {change != null && changePct != null && (
            <span className={`text-lg ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? "+" : ""}
              {change.toFixed(2)} ({up ? "+" : ""}
              {(changePct * 100).toFixed(2)}%)
            </span>
          )}
        </div>
      </div>
      {quote && (
        <dl className="grid grid-cols-6 gap-x-6 gap-y-1 text-sm">
          <Stat label="Open" value={quote.open?.toFixed(2)} />
          <Stat label="High" value={quote.high?.toFixed(2)} />
          <Stat label="Low" value={quote.low?.toFixed(2)} />
          <Stat label="Prev Close" value={quote.prev_close?.toFixed(2)} />
          <Stat label="Volume" value={fmt.compact(quote.volume)} sub={quote.volume_average ? `avg ${fmt.compact(quote.volume_average)}` : undefined} />
          <Stat
            label="52W Range"
            value={quote.year_low != null && quote.year_high != null ? `${quote.year_low.toFixed(2)} – ${quote.year_high.toFixed(2)}` : "—"}
          />
        </dl>
      )}
    </header>
  );
}

function Stat({ label, value, sub }: { label: string; value?: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="tabular-nums">
        {value ?? "—"}
        {sub && <span className="text-muted text-xs ml-1">({sub})</span>}
      </dd>
    </div>
  );
}
