import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

export type OHLCV = {
  time: UTCTimestamp | string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
};

export type Overlay = {
  label: string;
  color?: string;
  data: { time: UTCTimestamp | string; value: number }[];
};

export type PriceChartProps = {
  data: OHLCV[];
  mode?: "candle" | "line" | "area";
  overlays?: Overlay[];
  height?: number;
};

const THEME = {
  layout: {
    background: { type: ColorType.Solid, color: "#11151c" },
    textColor: "#8b94a7",
  },
  grid: {
    vertLines: { color: "#1a1f29" },
    horzLines: { color: "#1a1f29" },
  },
  rightPriceScale: { borderColor: "#2a3140" },
  timeScale: { borderColor: "#2a3140" },
};

export function PriceChart({ data, mode = "candle", overlays = [], height = 400 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const overlayRefs = useRef<ISeriesApi<"Line">[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, { ...THEME, height, autoSize: true });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      mainRef.current = null;
      overlayRefs.current = [];
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (mainRef.current) chart.removeSeries(mainRef.current);
    if (mode === "candle") {
      mainRef.current = chart.addSeries(CandlestickSeries, {
        upColor: "#34d399",
        downColor: "#f87171",
        borderVisible: false,
        wickUpColor: "#34d399",
        wickDownColor: "#f87171",
      });
    } else if (mode === "area") {
      mainRef.current = chart.addSeries(AreaSeries, {
        lineColor: "#5eead4",
        topColor: "rgba(94,234,212,0.3)",
        bottomColor: "rgba(94,234,212,0)",
      });
    } else {
      mainRef.current = chart.addSeries(LineSeries, { color: "#5eead4" });
    }
  }, [mode]);

  useEffect(() => {
    if (!mainRef.current) return;
    if (mode === "candle") {
      mainRef.current.setData(
        data
          .filter((d) => d.open != null && d.high != null && d.low != null)
          .map((d) => ({ time: d.time, open: d.open!, high: d.high!, low: d.low!, close: d.close })),
      );
    } else {
      mainRef.current.setData(data.map((d) => ({ time: d.time, value: d.close })));
    }
    chartRef.current?.timeScale().fitContent();
  }, [data, mode]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    overlayRefs.current.forEach((s) => chart.removeSeries(s));
    overlayRefs.current = overlays.map((ov, i) => {
      const s = chart.addSeries(LineSeries, {
        color: ov.color ?? OVERLAY_COLORS[i % OVERLAY_COLORS.length],
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      s.setData(ov.data);
      return s;
    });
  }, [overlays]);

  return <div ref={containerRef} style={{ height }} className="w-full" />;
}

const OVERLAY_COLORS = ["#fbbf24", "#a78bfa", "#60a5fa", "#f472b6"];
