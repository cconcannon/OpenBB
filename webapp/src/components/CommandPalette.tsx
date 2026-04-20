import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useEquitySearch } from "../api";

const ROUTES = [
  { to: "/", label: "Terminal" },
  { to: "/options", label: "Options" },
  { to: "/calendar", label: "Calendar" },
  { to: "/discovery", label: "Discovery" },
  { to: "/macro", label: "Macro" },
  { to: "/watchlist", label: "Watchlist" },
];

type SearchHit = { symbol?: string; name?: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const debounced = useDebounce(input, 200);
  const { data, isLoading } = useEquitySearch(debounced);
  const hits = useMemo<SearchHit[]>(() => {
    const r = (data as { results?: SearchHit[] } | undefined)?.results;
    return Array.isArray(r) ? r.slice(0, 8) : [];
  }, [data]);

  const go = (to: string) => {
    setOpen(false);
    setInput("");
    navigate({ to });
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      shouldFilter={false}
      className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[560px] max-w-[90vw] rounded-lg border border-line bg-surface-1 shadow-2xl z-50"
    >
      <Command.Input
        value={input}
        onValueChange={setInput}
        placeholder="Search symbols or jump to a view…"
        className="w-full px-4 py-3 bg-transparent border-b border-line outline-none text-slate-100 placeholder:text-muted"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
          {isLoading ? "Searching…" : "Type a symbol or view name"}
        </Command.Empty>
        {/^[A-Za-z.\-]{1,6}$/.test(input) && (
          <Command.Item
            value={`goto-${input}`}
            onSelect={() => go(`/equity/${input.toUpperCase()}`)}
            className="flex items-center gap-2 px-3 py-2 mb-1 rounded-md cursor-pointer aria-selected:bg-surface-2 text-slate-100 text-sm"
          >
            <span className="text-muted">Go to</span>
            <span className="font-mono font-semibold">{input.toUpperCase()}</span>
          </Command.Item>
        )}
        {hits.length > 0 && (
          <Command.Group heading="Symbols" className="text-xs text-muted px-2">
            {hits.map((h) => (
              <Command.Item
                key={h.symbol}
                value={`symbol-${h.symbol}`}
                onSelect={() => h.symbol && go(`/equity/${h.symbol}`)}
                className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer aria-selected:bg-surface-2 text-slate-100 text-sm"
              >
                <span className="font-mono">{h.symbol}</span>
                <span className="text-muted truncate ml-3">{h.name}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
        <Command.Group heading="Navigate" className="text-xs text-muted px-2 mt-2">
          {ROUTES.filter((r) => r.label.toLowerCase().includes(input.toLowerCase())).map((r) => (
            <Command.Item
              key={r.to}
              value={`route-${r.to}`}
              onSelect={() => go(r.to)}
              className="px-3 py-2 rounded-md cursor-pointer aria-selected:bg-surface-2 text-slate-100 text-sm"
            >
              {r.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
