export function TerminalPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
      <h1 className="text-2xl font-semibold">OpenBB Terminal</h1>
      <p className="text-muted">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-line text-xs">⌘K</kbd> to search a
        symbol or jump to a view.
      </p>
    </div>
  );
}

export function StubPage({ title, ticket }: { title: string; ticket: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted">
      <h1 className="text-xl text-slate-100">{title}</h1>
      <p className="text-sm">Tracked in {ticket}.</p>
    </div>
  );
}
