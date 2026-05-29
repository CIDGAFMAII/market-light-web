# Market Light

Market Light is a Next.js MVP for a low-distraction market companion. This phase focuses on the website and market-data experience only. It does not include ESP32 Arduino firmware, Prisma, SQLite, or authentication.

## Start

```bash
npm.cmd install
npm.cmd run dev
```

If port `3000` is already used:

```bash
npm.cmd run dev -- --port 3001
```

## Data Providers

Real providers:

- TWSE: `getStockInfo.jsp`
- OKX Instruments: `/api/v5/public/instruments`
- OKX Ticker: `/api/v5/market/ticker`

OKX instruments is not a price API. It is used to validate that an instrument such as `BTC-USDT` exists and is `live`. OKX ticker is the real price API.

Fallback order:

```text
real provider -> cache -> demo fallback
```

Demo mode:

```text
demo provider only
```

## Market Page

`/market` is a watch-board style page with:

- Real TWSE / OKX data from `/api/public/market`
- Real / Demo switch:
  - Real: `/api/public/market`
  - Demo: `/api/public/market?demoMode=true`
- Auto refresh: `Off / 10s / 30s / 60s`
- Market mood summary and companion message
- Search by `symbol` or `displayName`
- Sort by `price`, `changePercent`, or `volume`
- Filter by market: `ALL / TWSE / OKX`
- Filter by status: `ALL / up / down / up_alert / down_alert / calm`
- Source display: `TWSE / OKX / CACHE / DEMO`
- Stale badge for cache or fallback data
- Refresh button
- Loading, error, and fallback warnings

## Watchlist

`/watchlist` manages a local watchlist with `localStorage`. It is also the setup page for choosing which stocks or assets are synchronized to the ESP32 display.

Supported actions:

- Add TWSE symbols, for example `2330`
- Add OKX instruments, for example `BTC-USDT`
- Prevent duplicate `market + symbol` entries
- Validate blank input and symbol format before adding
- Show add success / failure messages
- Delete items
- Enable or disable items
- Move items up or down
- Mark `syncToDevice`
- Reset watchlist to defaults
- Display the full device query URL, for example `http://localhost:3000/api/device/market?symbols=TWSE:2330,OKX:BTC-USDT`
- Show the ESP32 sync list generated from `enabled=true` and `syncToDevice=true`
- Copy the full Device API URL
- Open the generated Device API URL in a new tab to inspect the JSON payload
- Validate TWSE via `/api/provider/twse`
- Validate OKX instruments via `/api/provider/okx/instruments`

Only items with both flags enabled are included in the ESP32 sync URL:

```text
enabled=true AND syncToDevice=true
```

Items with `enabled=false` are excluded even if `syncToDevice=true`. Items with `syncToDevice=false` are also excluded.

The page builds a complete URL with `window.location.origin`:

```text
http://localhost:3000/api/device/market?symbols=TWSE:0050,TWSE:2330,OKX:BTC-USDT
```

After deployment, the same page automatically uses the Vercel origin:

```text
https://<vercel-domain>/api/device/market?symbols=TWSE:0050,TWSE:2330,OKX:BTC-USDT
```

The ESP32 should read the complete Vercel API URL during a real deployed demo. No database is used in this phase; the `symbols` query string is for manual testing, while the `deviceId` flow uses a temporary in-memory device config store.

For the competition device flow, `/watchlist` can also save the current sync list to a server-side device config. The ESP32 can then keep using stable URLs and does not need firmware changes when the web watchlist changes:

```text
GET /api/device/config?deviceId=ML-ESP32-DEMO
GET /api/device/market?deviceId=ML-ESP32-DEMO
```

After the user changes `enabled` / `syncToDevice` and clicks `Save to ESP32 Device`, the page posts the generated `syncSymbols` list to:

```text
POST /api/device/sync-symbols
```

The next ESP32 refresh of `/api/device/market?deviceId=ML-ESP32-DEMO` reads the latest saved symbols from the device config. The older `symbols` query mode is still supported for manual testing and demos:

```text
/api/device/market?symbols=TWSE:0050,TWSE:2330,OKX:BTC-USDT
```

Current device config storage is an in-memory local/dev fallback only. On Vercel production, durable device settings should be moved to Vercel KV or Upstash Redis because server memory can reset across cold starts and deployments.

## Companion Mode

`/dashboard/companion` stores a local companion voice setting in `localStorage`.

Supported modes:

- `normal`
- `flirt`
- `quiet`

Messages are generated from `MarketStatus`. The flirt mode is intentionally light, playful, and non-explicit.

## Single Market Item

Route format:

```text
/market/[market]/[symbol]
```

Examples:

```text
/market/TWSE/2330
/market/OKX/BTC-USDT
```

The detail page shows full market fields, an OLED preview, and an ESP32-friendly JSON preview with a Copy JSON button.

## API Test URLs

TWSE:

```text
http://localhost:3000/api/provider/twse?symbol=2330&exchange=tse
```

OKX Instruments:

```text
http://localhost:3000/api/provider/okx/instruments?instType=SPOT&instId=BTC-USDT
```

OKX Ticker:

```text
http://localhost:3000/api/provider/okx/ticker?instId=BTC-USDT
```

Public Market:

```text
http://localhost:3000/api/public/market
```

Public Market demo mode:

```text
http://localhost:3000/api/public/market?demoMode=true
```

Device Market default list:

```text
http://localhost:3000/api/device/market
```

Device Market with explicit symbols:

```text
http://localhost:3000/api/device/market?symbols=TWSE:2330,TWSE:2317,OKX:BTC-USDT
```

Device Market by device ID:

```text
http://localhost:3000/api/device/market?deviceId=ML-ESP32-DEMO
```

Device Config:

```text
http://localhost:3000/api/device/config?deviceId=ML-ESP32-DEMO
```

Device Sync Symbols:

```text
POST http://localhost:3000/api/device/sync-symbols
```

Device Heartbeat:

```text
POST http://localhost:3000/api/device/heartbeat
```

Device Event:

```text
POST http://localhost:3000/api/device/event
```

Dashboard API Debug:

```text
http://localhost:3000/dashboard/api-debug
```

## Storage and Cache Limits

Current persistence is intentionally lightweight:

- Watchlist settings, market page settings, and companion mode are stored in browser `localStorage`.
- `localStorage` is per browser and per device. It is not shared across users, browsers, or machines.
- Device config and saved sync symbols currently use an in-memory server Map as a local/dev fallback.
- In-memory device config is not durable on Vercel production. Use Vercel KV or Upstash Redis before relying on it for persistent deployed device settings.
- Market fallback cache is in memory only.
- In-memory cache is lost when the Next.js server restarts or redeploys.
- There is still no Prisma / SQLite persistence in this phase.
- There is still no login or account system in this phase.
- ESP32 Arduino firmware is still out of scope; device routes are mock HTTP endpoints for integration testing.

## Scope

Current scope is website MVP only:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Real market provider routes
- Web dashboard and demo pages

Not included yet:

- ESP32 Arduino firmware
- Prisma / SQLite persistence
- Login or account system
