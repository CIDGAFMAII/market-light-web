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
- Search by `symbol` or `displayName`
- Sort by `price`, `changePercent`, or `volume`
- Filter by market: `ALL / TWSE / OKX`
- Filter by status: `ALL / up / down / up_alert / down_alert / calm`
- Source display: `TWSE / OKX / CACHE / DEMO`
- Stale badge for cache or fallback data
- Refresh button
- Loading, error, and fallback warnings

## Watchlist

`/watchlist` manages a local watchlist with `localStorage`.

Supported actions:

- Add TWSE symbols, for example `2330`
- Add OKX instruments, for example `BTC-USDT`
- Delete items
- Enable or disable items
- Move items up or down
- Mark `syncToDevice`
- Validate TWSE via `/api/provider/twse`
- Validate OKX instruments via `/api/provider/okx/instruments`

No database is used in this phase.

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

Device Market default list:

```text
http://localhost:3000/api/device/market
```

Device Market with explicit symbols:

```text
http://localhost:3000/api/device/market?symbols=TWSE:2330,TWSE:2317,OKX:BTC-USDT
```

Dashboard API Debug:

```text
http://localhost:3000/dashboard/api-debug
```

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
