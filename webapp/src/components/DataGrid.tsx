import { useMemo, useRef, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { fmt } from "./format";

export type Column<T> = {
  key: keyof T & string;
  header: string;
  format?: keyof typeof fmt;
  align?: "left" | "right";
  width?: number;
};

export type DataGridProps<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  height?: number;
  filterable?: boolean;
};

const ROW_H = 32;

export function DataGrid<T>({ data, columns, onRowClick, height = 400, filterable = true }: DataGridProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columnDefs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        accessorKey: c.key,
        header: c.header,
        size: c.width,
        cell: (ctx) => {
          const v = ctx.getValue();
          return c.format ? fmt[c.format](v) : (v as React.ReactNode) ?? "—";
        },
        meta: { align: c.align ?? (c.format && c.format !== "date" ? "right" : "left") },
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;
  const scrollRef = useRef<HTMLDivElement>(null);
  const virt = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_H,
    overscan: 8,
  });

  const tmpl = columns.map((c) => (c.width ? `${c.width}px` : "minmax(0, 1fr)")).join(" ");

  return (
    <div className="border border-line rounded-md bg-surface-1 flex flex-col" style={{ height }}>
      {filterable && (
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter…"
          className="px-3 py-2 bg-transparent border-b border-line outline-none text-sm placeholder:text-muted"
        />
      )}
      <div
        className="grid sticky top-0 bg-surface-2 border-b border-line text-xs uppercase tracking-wide text-muted"
        style={{ gridTemplateColumns: tmpl }}
      >
        {table.getHeaderGroups()[0].headers.map((h) => {
          const align = (h.column.columnDef.meta as { align?: string } | undefined)?.align ?? "left";
          const sorted = h.column.getIsSorted();
          return (
            <button
              key={h.id}
              onClick={h.column.getToggleSortingHandler()}
              className={`px-3 py-2 font-medium hover:text-slate-100 ${align === "right" ? "text-right" : "text-left"}`}
            >
              {flexRender(h.column.columnDef.header, h.getContext())}
              {sorted ? (sorted === "asc" ? " ↑" : " ↓") : ""}
            </button>
          );
        })}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div style={{ height: virt.getTotalSize(), position: "relative" }}>
          {virt.getVirtualItems().map((vi) => {
            const row = rows[vi.index] as Row<T>;
            return (
              <div
                key={row.id}
                className={`grid absolute w-full border-b border-line/50 text-sm ${
                  onRowClick ? "cursor-pointer hover:bg-surface-2" : ""
                }`}
                style={{
                  gridTemplateColumns: tmpl,
                  height: ROW_H,
                  transform: `translateY(${vi.start}px)`,
                }}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: string } | undefined)?.align ?? "left";
                  return (
                    <div
                      key={cell.id}
                      className={`px-3 flex items-center truncate tabular-nums ${
                        align === "right" ? "justify-end" : ""
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-3 py-1.5 text-xs text-muted border-t border-line">{rows.length} rows</div>
    </div>
  );
}
