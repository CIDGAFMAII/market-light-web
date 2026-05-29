# Market Light

Market Light is a Next.js MVP for a low-distraction market companion. This phase focuses on the website and market-data experience only. It does not include ESP32 Arduino firmware, Prisma, SQLite, or authentication.

The UI has been refined into a darker Corporate Trust style: black / slate surfaces, subdued indigo-violet accents, cleaner SaaS-like controls, and lower visual noise. The data positioning is unchanged: OKX crypto is the primary real data path, while Taiwan stock rows remain clearly marked demo display data.

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
- Auto refresh: `Off / 5s / 10s / 30s`
- Passive refresh protection: when My watchlist has many OKX real-time assets, `/market` automatically uses a safer effective refresh interval. Taiwan stock demo rows do not count toward this protection.
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

`/demo` is the competition showcase page for judges and live demos. It now simulates the finalized ESP32 three-button interaction model:

- Current screen mode: `MARKET / DETAIL / FLIRT`
- Current market source: `LIVE / GOOD / BAD / CRAZY_UP / CRAZY_DOWN / ERROR`
- Quiet Mode: `ON / OFF`
- OLED source labels: `[LIVE]`, `[GOOD]`, `[BAD]`, `[CRAZY+]`, `[CRAZY-]`, `[ERROR]`
- Quiet Mode adds `q`, for example `[LIVE q]`
- Web buttons simulate `A Short`, `A Double`, `A Long`, `B Short`, and `C Short`
- Fixed demo market states: `GOOD = +3.2%`, `BAD = -4.8%`, `CRAZY_UP = +8.5%`, `CRAZY_DOWN = -8.5%`, `ERROR = API Lost`
- Flirt lines are limited to two short OLED-friendly lines.
- DETAIL mode shows symbol, price, and a sparkline. OKX assets can use OKX candles data through `/api/device/chart`; Taiwan stock demo rows use demo sparklines.
- Taiwan stock screens are demo data; the focus is ESP32 sync and alert flow.

## ESP32 Three-Button Logic

ESP32 firmware is not implemented in this repository. The `/demo` page is a website simulation of the intended button behavior and OLED display logic. Future firmware should follow this specification.

Initial state:

```text
screenMode = MARKET
marketSource = LIVE
quietMode = OFF
currentSymbol = first synced symbol
```

Market source cycle:

```text
LIVE -> DEMO_GOOD -> DEMO_BAD -> DEMO_CRAZY_UP -> DEMO_CRAZY_DOWN -> DEMO_ERROR -> LIVE
```

OLED source labels:

```text
[LIVE]
[GOOD]
[BAD]
[CRAZY+]
[CRAZY-]
[ERROR]
[LIVE q] when Quiet Mode is ON
[CRAZY+ q] and [CRAZY- q] when Quiet Mode is ON
```

Button A:

- Short press: switch to the next symbol, keeping the current screen mode.
- Double click: toggle Quiet Mode.
- Long press: enter `DETAIL`.

Quiet Mode only reduces alert intensity. It can reduce or disable buzzer output and dim RGB brightness. OLED content and button behavior stay unchanged.

Button B:

- Short press: switch market source.
- B only changes source and never changes `screenMode`.
- In `FLIRT`, B still switches source and the Flirt line updates from the new market state.

Button C:

- In `MARKET`: enter `FLIRT` and generate a short Flirt line.
- In `FLIRT`: return to `MARKET`.
- In `DETAIL`: return directly to `MARKET`, not `FLIRT`.

DETAIL mode:

- Shows `symbol / price / sparkline`.
- A Short switches to the next symbol's detail chart.
- B Short switches source and stays in `DETAIL`.
- C Short returns directly to `MARKET`.
- Idle timeout returns to `MARKET` after 10 seconds from the last operation.

DETAIL chart range:

```text
5m / 15m / 1h / 24h
```

For OKX assets, the detail chart can be fetched from the OKX candles endpoint through the Market Light API:

```text
GET /api/device/chart?symbol=OKX:BTC-USDT&range=15m
```

The chart API uses a 60 second in-memory cache per `OKX_CHART:<symbol>:<range>` key. If OKX candles fail, the API returns stale cache when available; otherwise it returns a demo sparkline so DETAIL mode does not go blank.

Future ESP32 firmware should not request charts on every ticker refresh. Suggested behavior:

- Market ticker: poll `/api/device/market` according to `refreshIntervalSec`.
- Detail chart: request `/api/device/chart` only when entering `DETAIL`, switching symbol, or switching chart range.
- ESP32 may also use locally accumulated points as a fallback.

Flirt Mode:

- Flirt lines depend only on market state, not per-stock personality.
- `GOOD`: rising, lightly playful.
- `BAD`: falling, comforting.
- `CRAZY_UP`: violent upside move, playful but cautious.
- `CRAZY_DOWN`: violent downside move, comforting and steady.
- `ERROR`: API / Wi-Fi easter egg.
- `LIVE`: maps `up / up_alert` to `GOOD`, `down / down_alert` to `BAD`, future strong upside to `CRAZY_UP`, future strong downside to `CRAZY_DOWN`, and `error` to `ERROR`.
- Lines must fit a 0.96 inch OLED: at most two lines, roughly 6-9 Chinese characters per line.

Examples:

```text
跌的是價格
不是你的價值

不要追高
但可以追我

市場在震
你先穩

不是不回你
是我連不上
```

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

`/dashboard/companion` is a website-only copy sandbox stored in `localStorage`. It is not the final ESP32 button logic. The final ESP32 Flirt Mode behavior is documented in the three-button logic above and simulated in `/demo`.

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

Device Chart:

```text
http://localhost:3000/api/device/chart?symbol=OKX:BTC-USDT&range=15m
http://localhost:3000/api/device/chart?symbol=TWSE:2330&range=15m
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
