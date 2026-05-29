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

Competition data policy:

- OKX Ticker is the primary real-time data source for crypto assets.
- Taiwan stock rows are demo-only in this competition version.
- Stable real-time Taiwan stock data usually requires a licensed or paid provider.
- TWSE MIS and FinMind routes are kept as legacy / experimental diagnostics, not the official competition data path.

OKX instruments is not a price API. It is used to validate that an instrument such as `BTC-USDT` exists and is `live`. OKX ticker is the real price API.

Legacy FinMind token settings are optional:

```text
FINMIND_TOKEN=
FINMIND_CACHE_TTL_MS=60000
```

FinMind tokens are limited to 600 API calls per hour. The legacy debug route uses `Authorization: Bearer <token>` when `FINMIND_TOKEN` is set. The competition market page does not rely on FinMind for official Taiwan stock realtime data.

`FINMIND_CACHE_TTL_MS` controls the in-memory FinMind provider cache. Keep it at least `60000` ms for demos so repeated refreshes do not burn through the hourly quota. On Vercel, set `FINMIND_TOKEN` in Project Settings -> Environment Variables.

Fallback order:

```text
OKX real provider -> cache -> demo fallback
Taiwan stock demo rows -> demo display flow
```

TWSE MIS frequently returns `z="-"`, and FinMind `TaiwanStockPrice` is daily data, not tick-level realtime. True realtime Taiwan stock watch-board data requires a broker API, WebSocket, or licensed market-data feed. This project is a competition demo focused on low-distraction market alerts, ESP32 synchronization, OLED/RGB display, and companion interaction.

Demo mode:

```text
demo provider only
```

## Market Page

`/market` is the real market watch page for OKX crypto assets, with Taiwan stock demo rows kept to show the end-to-end device flow:

- Real OKX data from `/api/public/market`
- Taiwan stock rows marked as `DEMO`
- Real / Demo switch:
  - Real: `/api/public/market`
  - Demo: `/api/public/market?demoMode=true`
- View switch:
  - Default market: reads the system default list from `/api/public/market`
  - My watchlist: reads enabled assets from the `/watchlist` `localStorage` list and requests `/api/device/market?symbols=...`
- Auto refresh: `Off / 10s / 30s / 60s`
- Compact market mood summary
- Search by `symbol` or `displayName`
- Sort by `price`, `changePercent`, or `volume`
- Filter by market: `ALL / TWSE / OKX`
- Filter by status: `ALL / up / down / up_alert / down_alert / calm`
- Source display: `OKX / CACHE / DEMO`
- Quote quality display: `latest / partial / daily / fallback`
- Stale badge for cache or fallback data
- Refresh button
- Loading and error states
- Compact fallback notice with expandable provider warnings

Price color preference is stored in browser `localStorage` with `market-light-price-color-mode-v1`:

- International mode: green means up, red means down.
- Taiwan mode: red means up, green means down.

The default is International mode because the competition demo flow uses OKX crypto as the main real data source. `/market`, `/market/[market]/[symbol]`, and `/demo` share this setting.

## Demo Page

`/demo` is the competition showcase page for judges and live demos. It contains the visual and narrative device experience:

- OLED preview
- RGB / status preview
- Companion face and `normal / flirt / quiet` message modes
- Interactive status switching: `calm / up / up_alert / down / down_alert / error / closed`
- Fallback scenario demonstration with `DEMO` / `STALE` badges
- ESP32 JSON preview
- Device config and device market API URL examples
- Taiwan stock screens are demo data; the focus is ESP32 sync and alert flow.

## Watchlist

`/watchlist` manages a local watchlist with `localStorage`. Enabled assets appear in `/market` under the My watchlist view, and assets marked for ESP32 display are saved to the device sync list.

Competition demos should prefer OKX crypto assets. Taiwan stock entries are currently demo display data.

Supported actions:

- Add TWSE symbols, for example `2330`
- Add OKX instruments, for example `BTC-USDT`
- Prevent duplicate `market + symbol` entries
- Validate blank input and symbol format before adding
- Show add success / failure messages
- Delete items
- Show or hide items in the market watch page
- Mark whether items are shown on the ESP32
- Reset watchlist to defaults
- Show the ESP32 sync list generated from `syncToDevice=true`
- Keep developer API URLs in a collapsed developer details panel
- Validate TWSE via `/api/provider/twse`
- Validate OKX instruments via `/api/provider/okx/instruments`

The two toggles have separate meanings:

```text
enabled=true        -> appears in /market under My watchlist
syncToDevice=true   -> saved to the ESP32 device sync list
```

Items with `syncToDevice=false` can still appear in `/market` when `enabled=true`, but they are excluded from `/api/device/market?deviceId=...` after saving the ESP32 device list.

The developer details panel builds a complete manual testing URL with `window.location.origin`:

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

After the user changes `syncToDevice` and clicks `Save to ESP32 Device`, the page posts the generated `syncSymbols` list to:

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

Legacy / experimental only. Not the official competition realtime stock source.

TWSE raw debug:

```text
http://localhost:3000/api/provider/twse?symbol=2330&exchange=tse&debug=true
```

FinMind Daily:

```text
http://localhost:3000/api/provider/finmind/daily?symbol=2330&debug=true
```

Legacy / experimental daily data only. Not tick-level realtime.

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

## Page Roles

- `/market`: real OKX crypto watch page with Taiwan stock demo rows.
- `/demo`: competition showcase and device interaction story.
- `/watchlist`: choose which assets synchronize to ESP32.
- `/dashboard/api-debug`: API testing and OLED/device preview verification.

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
- OKX real market provider routes
- Taiwan stock demo display flow
- Web dashboard and demo pages

Not included yet:

- ESP32 Arduino firmware
- Prisma / SQLite persistence
- Login or account system
