import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChartBarIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  ListBulletIcon,
  CubeTransparentIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ITEMS: NavItem[] = [
  { to: "/", label: "Terminal", icon: RectangleGroupIcon },
  { to: "/equity/AAPL", label: "Equity", icon: ChartBarIcon },
  { to: "/options", label: "Options", icon: CubeTransparentIcon },
  { to: "/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { to: "/discovery", label: "Discovery", icon: MagnifyingGlassIcon },
  { to: "/macro", label: "Macro", icon: GlobeAltIcon },
  { to: "/watchlist", label: "Watchlist", icon: ListBulletIcon },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-48 shrink-0 border-r border-line bg-surface-0 flex flex-col">
      <div className="px-4 py-4 text-sm font-semibold tracking-wide text-accent">OpenBB</div>
      <nav className="flex-1 p-2 space-y-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const root = "/" + item.to.split("/")[1];
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(root);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? "bg-surface-2 text-accent" : "text-muted hover:text-slate-100 hover:bg-surface-1"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-[10px] text-muted border-t border-line">
        API: <span className="font-mono">{localStorage.getItem("openbb.apiBaseUrl") ?? "127.0.0.1:6900"}</span>
      </div>
    </aside>
  );
}
