const nf = new Intl.NumberFormat("en-US");
const cf = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const pf = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const fmt = {
  number: (v: unknown) => (typeof v === "number" ? nf.format(v) : "—"),
  currency: (v: unknown) => (typeof v === "number" ? cf.format(v) : "—"),
  percent: (v: unknown) => (typeof v === "number" ? pf.format(v) : "—"),
  compact: (v: unknown) => (typeof v === "number" ? compact.format(v) : "—"),
  date: (v: unknown) => {
    if (!v) return "—";
    const d = new Date(v as string | number);
    return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
  },
};
