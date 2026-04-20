import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Sidebar } from "./components/Sidebar";
import { CommandPalette } from "./components/CommandPalette";
import { TerminalPage, StubPage } from "./routes/stubs";
import { EquityPage } from "./routes/EquityPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="h-full flex">
      <Sidebar />
      <main className="flex-1 min-w-0 bg-surface-1 flex flex-col overflow-auto">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TerminalPage,
});

const equityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/equity/$symbol",
  component: function Equity() {
    const { symbol } = equityRoute.useParams();
    return <EquityPage symbol={symbol} />;
  },
});

const stub = (path: string, title: string, ticket: string) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => <StubPage title={title} ticket={ticket} />,
  });

const optionsRoute = stub("/options", "Options Workbench", "PLU-8");
const calendarRoute = stub("/calendar", "Market Calendar", "PLU-9");
const discoveryRoute = stub("/discovery", "Discovery & Screeners", "PLU-10");
const macroRoute = stub("/macro", "Macro Dashboard", "PLU-11");
const watchlistRoute = stub("/watchlist", "Watchlist", "PLU-12");

const routeTree = rootRoute.addChildren([
  indexRoute,
  equityRoute,
  optionsRoute,
  calendarRoute,
  discoveryRoute,
  macroRoute,
  watchlistRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
