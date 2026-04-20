import { useMemo, useState } from "react";
import { useEquityQuote, useEquityHistorical } from "../api";
import { PriceChart, type OHLCV } from "../components/PriceChart";
import { DataGrid, type Column } from "../components/DataGrid";
import { QuoteHeader, type QuoteData } from "../components/QuoteHeader";
import { sma, ema } from "../components/indicators";

type Bar = { date: string; open: number; high: number; low: number; close: number; volume?: number };

const TIMEFRAMES = {
  "1M": { months: 1, interval: "1d" },
  "3M": { months: 3, interval: "1d" },
  "6M": { months: 6, interval: "1d" },
  "1Y": { months: 12, interval: "1d" },
  "5Y": { months: 60, interval: "1W" },
} as const;
type Timeframe = keyof typeof TIMEFRAMES;

const OVERLAYS = {
  "SMA 20": (d: OHLCV[]) => sma(d, 20, "#fbbf24"),
  "SMA 50": (d: OHLCV[]) => sma(d, 50, "#a78bfa"),
  "EMA 20": (d: OHLCV[]) => ema(d, 20, "#60a5fa"),
} as const;
type OverlayKey = keyof typeof OVERLAYS;

export function EquityPage({ symbol }: { symbol: string }) {
  const { data: q } = useEquityQuote(symbol);
  const quote = ((q as { results?: QuoteData[] } | undefined)?.results ?? [])[0];

  const [tf, setTf] = useState<Timeframe>("1Y");
  const [mode, setMode] = useState<"candle" | "line" | "area">("candle");
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayKey>>(new Set());

  const start = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - TIMEFRAMES[tf].months);
    return d.toISOString().slice(0, 10);
  }, [tf]);

  const { data: h, isLoading, error } = useEquityHistorical(symbol, {
    start_date: start,
    interval: TIMEFRAMES[tf].interval,
  });
  const bars = useMemo<Bar[]>(() => ((h as { results?: Bar[] } | undefined)?.results ?? []), [h]);

  const chartData = useMemo<OHLCV[]>(
    () => bars.map((b) => ({ time: b.date.slice(0, 10), open: b.open, high: b.high, low: b.low, close: b.close })),
    [bars],
  );

  const overlays = useMemo(
    () => Array.from(activeOverlays).map((k) => OVERLAYS[k](chartData)),
    [activeOverlays, chartData],
  );

  return (
    <div className="p-6 space-y-6">
      <QuoteHeader symbol={symbol} quote={quote} />

      <section>
        <div className="flex items-center gap-4 mb-2">
          <Segmented options={Object.keys(TIMEFRAMES) as Timeframe[]} value={tf} onChange={setTf} />
          <Segmented options={["candle", "line", "area"] as const} value={mode} onChange={setMode} />
          <div className="ml-auto flex gap-1">
            {(Object.keys(OVERLAYS) as OverlayKey[]).map((k) => (
              <button
                key={k}
                onClick={() =>
                  setActiveOverlays((s) => {
                    const next = new Set(s);
                    next.has(k) ? next.delete(k) : next.add(k);
                    return next;
                  })
                }
                className={`px-2 py-1 rounded text-xs ${
                  activeOverlays.has(k) ? "bg-surface-2 text-accent" : "text-muted hover:text-slate-100"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        {isLoading && <div className="h-[400px] flex items-center justify-center text-muted">Loading chart…</div>}
        {error && <div className="text-red-400 text-sm">Chart data failed: {error.message}</div>}
        {!isLoading && !error && <PriceChart data={chartData} mode={mode} overlays={overlays} height={400} />}
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-2">Historical Bars</h2>
        <DataGrid data={bars} columns={GRID_COLUMNS} height={320} />
      </section>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 p-0.5 bg-surface-0 rounded-md text-xs">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded ${value === o ? "bg-surface-2 text-accent" : "text-muted hover:text-slate-100"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const GRID_COLUMNS: Column<Bar>[] = [
  { key: "date", header: "Date", format: "date", width: 120 },
  { key: "open", header: "Open", format: "currency" },
  { key: "high", header: "High", format: "currency" },
  { key: "low", header: "Low", format: "currency" },
  { key: "close", header: "Close", format: "currency" },
  { key: "volume", header: "Volume", format: "compact" },
];
