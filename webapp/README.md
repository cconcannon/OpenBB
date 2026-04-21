# OpenBB Research Terminal (webapp)

A standalone React SPA that talks to a locally running OpenBB Platform API.
Built with Webpack 5 + Babel (pure-JS toolchain — no native binaries required).

## Quick start

From the repo root:

```bash
./run-webapp.sh
```

This starts both the API server (`:6900`) and the webpack dev server (`:1471`)
with prefixed, interleaved logs. Ctrl-C stops both.

To run them separately instead:

```bash
# Terminal 1 — API server (from repo root)
.venv/bin/openbb-api --host 127.0.0.1 --port 6900

# Terminal 2 — webapp
cd webapp
npm install
npm run dev
```

Open <http://localhost:1471>. The UI will call the API at `http://127.0.0.1:6900`
(configurable at runtime via `localStorage["openbb.apiBaseUrl"]`).

## First-time backend setup

The webapp needs the OpenBB Platform installed in `.venv` at the repo root.

If `python openbb_platform/dev_install.py -e` works in your environment, use that.

If it fails on your package index (Poetry/dulwich resolution errors), install the
packages directly — this is the minimal set the webapp exercises:

```bash
python3 -m venv .venv
.venv/bin/pip install -e openbb_platform/core
.venv/bin/pip install \
  -e openbb_platform/extensions/platform_api \
  -e openbb_platform/extensions/{commodity,crypto,currency,derivatives,economy,equity,etf,fixedincome,index,news,regulators} \
  -e openbb_platform/providers/{benzinga,bls,cftc,congress_gov,federal_reserve,fmp,fred,imf,intrinio,oecd,tiingo,tradingeconomics,eia,yfinance}
```

> Providers `econdb`, `sec`, `government_us`, `cboe`, and `tmx` depend on
> `aiohttp-client-cache` / `random-user-agent`, which may be missing from
> restricted indexes. They are not required for the webapp.

## Running the API server

Either entrypoint works — the webapp only cares that it answers on `:6900`:

```bash
# Launcher (includes /widgets.json, what the desktop shell expects)
.venv/bin/openbb-api --host 127.0.0.1 --port 6900

# Or bare FastAPI with auto-reload, useful when editing platform code
.venv/bin/uvicorn openbb_core.api.rest_api:app --host 127.0.0.1 --port 6900 --reload
```

Verify: `curl -s http://127.0.0.1:6900/openapi.json | head -c 200` should print the OpenAPI preamble.

## Webapp scripts

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Webpack dev server with HMR on <http://localhost:1471>   |
| `npm run build`     | Production bundle → `dist/`                              |
| `npm run typecheck` | `tsc --noEmit`                                           |
| `npm run gen:api`   | Regenerate `src/api/schema.d.ts` from `src/api/openapi.json` |

### Regenerating API types

When backend routes change, refresh the OpenAPI schema and types:

```bash
curl http://127.0.0.1:6900/openapi.json -o src/api/openapi.json
npm run gen:api
```

## Stack

React 19 · TanStack Router/Query/Table/Virtual · openapi-fetch · Tailwind v3 ·
cmdk · lightweight-charts · Webpack 5 + Babel · TypeScript.

## Notes

- Symbol search in the command palette uses `/equity/search`, which locally
  resolves only via the `intrinio` provider (needs an API key). Without a key,
  use the **"Go to ⟨ticker⟩"** fallback to navigate directly.
- This app is independent of `desktop/` (the Tauri shell). Both target the same
  local API, but you do not need Tauri, Rust, or Vite to develop here.
