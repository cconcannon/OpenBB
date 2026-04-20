import type { OHLCV, Overlay } from "./PriceChart";

export function sma(data: OHLCV[], period: number, color?: string): Overlay {
  const out: Overlay["data"] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) sum -= data[i - period].close;
    if (i >= period - 1) out.push({ time: data[i].time, value: sum / period });
  }
  return { label: `SMA ${period}`, color, data: out };
}

export function ema(data: OHLCV[], period: number, color?: string): Overlay {
  const k = 2 / (period + 1);
  const out: Overlay["data"] = [];
  let prev: number | undefined;
  for (const d of data) {
    prev = prev == null ? d.close : d.close * k + prev * (1 - k);
    out.push({ time: d.time, value: prev });
  }
  return { label: `EMA ${period}`, color, data: out.slice(period - 1) };
}
