---

````markdown
# Codex Prompt：Market Light 網站優先版開發任務

你是一位資深全端工程師與 UI 設計師。請協助我開發一個名為 **Market Light** 的網站 MVP。

## 0. 本次開發重點

本階段先以「網站」為主，ESP32 後面再處理。

請完成：
1. Market Light 產品網站
2. 市場資料展示頁
3. Demo 頁
4. Dashboard
5. 裝置設定頁
6. 股票設定頁
7. 桌寵設定頁
8. API Debug 頁
9. Prisma + SQLite 資料模型
10. Device API，讓 ESP32 未來可以直接串接
11. TWSE / OKX provider 架構

目前不要寫 ESP32 Arduino 程式，只要把後端 API 和網站做好。

---

# 1. 專案背景

Market Light 是一個基於 ESP32 的低干擾股價提醒裝置。

硬體概念：
- ESP32 連接 Wi-Fi
- OLED 顯示股價、漲跌幅、成交時間、更新時間
- RGB LED 根據市場狀態變色
- 蜂鳴器只在明顯波動時短提示
- 三顆 Button 操作股票切換、詳細資訊、模式切換
- 市場小助手會依照股價狀態顯示不同表情
- 非交易時間可切換 OKX 或 Demo 資料
- API 錯誤時不可黑屏，必須保留快取或顯示錯誤狀態

本階段網站目標：
- 讓使用者可以看市場資料
- 讓使用者可以設定 ESP32 未來要顯示哪些股票
- 讓使用者可以設定低干擾模式、亮度、蜂鳴器
- 讓使用者可以設定市場小助手 / 桌寵
- 讓 Demo 頁可以模擬 OLED、RGB、桌寵狀態
- 讓 `/api/device/config` 和 `/api/device/market` 未來可直接給 ESP32 使用

---

# 2. 技術棧

請使用：

```txt
Next.js App Router
TypeScript
Tailwind CSS
Prisma
SQLite
````

可使用：

* lucide-react
* clsx
* zod
* bcryptjs 可選，但 MVP 可先不用

不要使用：

* next-auth
* WebSocket
* 真正 AI API
* 太複雜的權限系統

專案需能用以下指令啟動：

```bash
npm install
npm run dev
```

資料庫初始化：

```bash
npx prisma migrate dev
npx prisma db seed
```

---

# 3. UI 設計風格

## 3.1 風格方向

我想要偏 **Cyberpunk / Terminal / Neon Dashboard**，但不要太廉價、不要太 AI 模板味。

請參考以下風格元素：

* 黑色背景
* 深灰卡片
* cyan / fuchsia / yellow 作為霓虹點綴
* monospace 字體
* terminal feel
* scanline overlay 可以有，但透明度要低
* OLED 模擬畫面要像小型裝置螢幕
* Dashboard 要像「硬體控制台」而不是普通股票網站

## 3.2 參考 HTML 風格

請參考以下風格概念，不要完全照抄，但保留精神：

```html
<body class="bg-black min-h-screen text-white">
  <div class="fixed inset-0 pointer-events-none scanline opacity-20 z-50"></div>

  <nav class="bg-black/80 border-b border-cyan-500/30 px-6 py-4">
    <span class="font-cyber font-bold text-fuchsia-500">MARKET LIGHT</span>
    <span class="font-mono text-yellow-400 text-sm">[SYSTEM ONLINE]</span>
  </nav>

  <section class="py-16 text-center relative">
    <p class="font-mono text-cyan-400 mb-4">&gt;&gt; MARKET SYSTEM ONLINE_</p>
    <h1 class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-400">
      MARKET LIGHT
    </h1>
    <p class="font-mono text-xl text-gray-400">
      Low-distraction market companion for your desk.
    </p>
  </section>

  <section class="grid grid-cols-4 gap-4">
    <div class="bg-gray-900/80 border border-cyan-500/30 p-6 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
      <p class="font-mono text-xs text-cyan-400 mb-2">// DEVICE</p>
      <p class="text-3xl text-white">ONLINE</p>
    </div>
  </section>
</body>
```

## 3.3 字體

使用：

* `Share Tech Mono` 或系統 monospace
* 標題可以用類似 Orbitron 的 cyber 字體
* 但不要整頁都太難讀

可以在 `globals.css` 中引入 Google Fonts：

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Share+Tech+Mono&display=swap');
```

## 3.4 色彩

請使用 CSS variables：

```css
:root {
  --bg: #030305;
  --surface: #0c0f14;
  --surface-2: #121722;
  --border-cyan: rgba(0, 255, 255, 0.32);
  --border-pink: rgba(255, 0, 255, 0.32);
  --border-yellow: rgba(255, 255, 0, 0.28);

  --cyan: #00ffff;
  --pink: #ff00ff;
  --yellow: #facc15;
  --green: #22c55e;
  --red: #ef4444;
  --muted: #9ca3af;
}
```

台股習慣：

* 紅色 = 上漲
* 綠色 = 下跌

## 3.5 動畫限制

可以有：

* scanline
* subtle glow
* terminal cursor blink
* OLED refresh flicker
* RGB slow pulse

不要過度：

* 不要到處 glitch
* 不要整頁閃爍
* 不要大量 hover scale
* 不要太多重陰影

---

# 4. 開發階段

請分階段完成，不要一次爆量。

## Phase 1：網站骨架與靜態 Demo

先完成：

* Next.js 專案
* Tailwind CSS
* globals.css cyberpunk theme
* 首頁 `/`
* 市場展示頁 `/market`
* Demo 頁 `/demo`
* Dashboard layout
* 假資料
* OLED 模擬卡片
* RGB 模擬燈
* Pet face component

## Phase 2：API 與 Prisma

再完成：

* Prisma
* SQLite
* Seed data
* Public market API
* Device config API
* Device market API
* Demo mode API
* Stock list CRUD API

## Phase 3：簡化登入與 Dashboard

再完成：

* Login / Register 頁面
* 簡化 session 或 localStorage mock auth
* Dashboard overview
* 裝置綁定頁
* 股票清單設定
* 裝置設定
* 桌寵設定

## Phase 4：TWSE / OKX Provider

最後完成：

* TWSE provider
* OKX instruments provider
* OKX ticker provider
* Demo provider fallback
* API Debug 頁可以測試 provider

目前仍以網站穩定展示為主，不要卡在外部 API。

---

# 5. 頁面需求

## 5.1 首頁 `/`

首頁要像 Cyberpunk hardware dashboard。

Hero 內容：

* 標題：Market Light
* 副標：Low-distraction market companion
* 中文說明：把即時金融資訊轉成 OLED、RGB 與市場小助手反應，讓桌面提醒剛剛好。
* CTA：

  * View Demo
  * Open Dashboard

右側或下方放 OLED 模擬器：

```txt
2330 TSMC
1075.00 +1.80%
(^o^) Trade 13:30
Update 8s
```

首頁區塊：

1. System Online Hero
2. OLED Device Preview
3. 三個亮點：

   * Low Noise Alert
   * Market Pet
   * Freshness Display
4. Device Flow：

```txt
TWSE / OKX
   ↓
Market Light Cloud
   ↓
ESP32
   ↓
OLED / RGB / Buttons
```

5. Demo Preview：

   * calm
   * up_alert
   * down_alert
   * error

---

## 5.2 市場頁 `/market`

未登入也可以看。

功能：

* 顯示預設股票清單
* 顯示價格、漲跌、漲跌幅、成交時間、更新時間
* 顯示 market mood
* 顯示資料來源 TWSE / OKX / DEMO
* 顯示狀態 badge
* cyberpunk terminal-like market table

預設資料：

* 2330 TSMC
* 2317 HONHAI
* 2454 MediaTek
* 0050 ETF
* BTC-USDT
* ETH-USDT

---

## 5.3 Demo 頁 `/demo`

這是展示重點。

功能：

* 左側：OLED 模擬器
* 中間：RGB LED 模擬
* 右側：控制面板
* 下方：JSON preview

可以切換：

* calm
* up
* up_alert
* down
* down_alert
* error
* closed
* quiet

切換後：

* OLED 文字改變
* RGB 顏色改變
* Pet face 改變
* JSON preview 改變

Demo 頁要有：

* Copy JSON
* Reset
* Simulate API Error
* Simulate TWSE Closed
* Simulate Quiet Mode

---

## 5.4 Login `/login`

MVP 可以先做簡化登入。

欄位：

* email
* password

測試帳號：

```txt
email: demo@marketlight.local
password: demo1234
```

登入後導向 `/dashboard`。

MVP 可以先用 localStorage mock auth，不要卡在正式 auth。

---

## 5.5 Register `/register`

欄位：

* email
* displayName
* password

建立後導向 login 或 dashboard。

---

## 5.6 Dashboard `/dashboard`

Dashboard 是登入後主頁。

Layout：

* 左側 sidebar
* 中間主內容
* 右側 OLED / device preview

Sidebar：

* Overview
* Device
* Bind
* Stocks
* Pet
* API Debug
* Demo

Dashboard Overview 顯示：

* 裝置名稱
* 綁定狀態
* deviceCode
* lastSeenAt
* 目前股票數量
* quietMode
* demoMode
* petName
* OLED preview
* API status

---

## 5.7 裝置頁 `/dashboard/device`

功能：

* 顯示裝置名稱
* 顯示 deviceCode
* 顯示是否已綁定
* 顯示最後同步時間

設定：

* brightness slider
* quietMode toggle
* buzzerEnabled toggle
* updateInterval select
* rotateInterval select
* demoMode toggle

MVP 階段只需要一台裝置。

預設 deviceCode：

```txt
ML-8F3A2C
```

---

## 5.8 綁定頁 `/dashboard/bind`

使用者輸入 deviceCode。

如果輸入：

```txt
ML-8F3A2C
```

就顯示綁定成功。

MVP 階段不用做真正 token 綁定，但資料模型要預留 deviceTokenHash 欄位。

---

## 5.9 股票設定頁 `/dashboard/stocks`

功能：

* 顯示目前 ESP32 要輪播的股票
* 新增股票
* 刪除股票
* 啟用 / 停用
* 修改 displayOrder
* 用上移 / 下移按鈕排序
* 市場選擇：

  * TWSE
  * OKX
  * DEMO

欄位：

* symbol
* market
* displayName
* enabled
* displayOrder

---

## 5.10 桌寵設定頁 `/dashboard/pet`

功能：

* petName
* petEnabled
* mood
* level
* exp
* animationStyle
* interactionEnabled

按鈕：

* Feed
* Sleep
* Wake
* Reset Mood

MVP 階段只改 UI 狀態，不需要複雜成長系統。

---

## 5.11 API Debug 頁 `/dashboard/api-debug`

顯示：

* `/api/public/market`
* `/api/device/config`
* `/api/device/market`
* `/api/device/demo?state=up_alert`
* `/api/provider/twse?symbol=2330`
* `/api/provider/okx/instruments?instType=SPOT`
* `/api/provider/okx/ticker?instId=BTC-USDT`

每個 endpoint 都要：

* 顯示 JSON
* Copy JSON
* Refresh

這頁很重要，因為後面要給 ESP32 測試。

---

# 6. 資料庫模型 Prisma

請建立 Prisma schema。

## User

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  displayName  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  devices      Device[]
}
```

## Device

```prisma
model Device {
  id              String   @id @default(cuid())
  deviceCode      String   @unique
  deviceTokenHash String?
  userId          String?
  deviceName      String   @default("Market Light")
  isBound         Boolean  @default(false)
  firmwareVersion String?
  lastSeenAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User?           @relation(fields: [userId], references: [id])
  settings        DeviceSettings?
  stocks          DeviceStock[]
  pet             PetSettings?
  events          DeviceEvent[]
}
```

## DeviceSettings

```prisma
model DeviceSettings {
  id             String   @id @default(cuid())
  deviceId       String   @unique
  brightness     Int      @default(80)
  quietMode      Boolean  @default(false)
  buzzerEnabled  Boolean  @default(true)
  updateInterval Int      @default(30000)
  rotateInterval Int      @default(45000)
  demoMode       Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  device         Device   @relation(fields: [deviceId], references: [id])
}
```

## DeviceStock

```prisma
model DeviceStock {
  id           String   @id @default(cuid())
  deviceId     String
  symbol       String
  market       String
  displayName  String
  displayOrder Int      @default(0)
  enabled      Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  device       Device   @relation(fields: [deviceId], references: [id])
}
```

## PetSettings

```prisma
model PetSettings {
  id                 String   @id @default(cuid())
  deviceId            String   @unique
  petName             String   @default("Market Pet")
  petEnabled          Boolean  @default(true)
  level               Int      @default(1)
  exp                 Int      @default(0)
  mood                String   @default("normal")
  animationStyle      String   @default("simple")
  interactionEnabled  Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  device              Device   @relation(fields: [deviceId], references: [id])
}
```

## MarketCache

```prisma
model MarketCache {
  id            String   @id @default(cuid())
  symbol        String
  market        String
  displayName   String
  price         Float
  yesterday     Float?
  change        Float
  changePercent Float
  high          Float?
  low           Float?
  volume        Int?
  tradeTime     String?
  source        String
  status        String
  message       String?
  updatedAt     DateTime @updatedAt

  @@unique([symbol, market])
}
```

## DeviceEvent

```prisma
model DeviceEvent {
  id        String   @id @default(cuid())
  deviceId  String
  eventType String
  message   String?
  createdAt DateTime @default(now())

  device    Device   @relation(fields: [deviceId], references: [id])
}
```

---

# 7. 外部 API 設定

## 7.1 TWSE API

請建立 provider：

```txt
lib/market/providers/twse.ts
```

TWSE API 範例：

```txt
https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw&json=1&delay=0
```

Route：

```http
GET /api/provider/twse?symbol=2330
```

實作需求：

* symbol=2330 時轉成 `tse_2330.tw`
* fetch TWSE URL
* normalize 成 MarketData

TWSE 常用欄位：

```txt
c = 股票代號
n = 股票名稱
z = 最新成交價
y = 昨收
o = 開盤
h = 最高
l = 最低
v = 累積成交量
d = 資料日期
t = 最近成交時間
```

注意：

* 如果 `z` 是 `"-"`，不要直接 parseFloat
* 此時應回傳 status: "closed" 或 "error"
* price 可使用上一筆快取，若沒有快取則回傳 success false
* TWSE API 可能有 CORS / header / referer 問題，若 fetch 失敗要 fallback demo

normalized output：

```ts
type MarketData = {
  symbol: string;
  market: "TWSE" | "OKX" | "DEMO";
  displayName: string;
  price: number;
  yesterday?: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  tradeTime?: string;
  source: string;
  status: MarketStatus;
  message?: string;
};
```

---

## 7.2 OKX Instruments API

你提供的 OKX API 是「交易產品基礎資訊」，用來查可交易產品，不是即時行情價格。

請建立 provider：

```txt
lib/market/providers/okx-instruments.ts
```

Endpoint：

```txt
https://www.okx.com/api/v5/public/instruments?instType=SPOT
```

Route：

```http
GET /api/provider/okx/instruments?instType=SPOT
```

Request params：

* instType required
* 支援 SPOT / MARGIN / SWAP / FUTURES / OPTION / EVENTS
* instId optional
* instFamily optional

Response 需要保留重要欄位：

* instId
* instType
* baseCcy
* quoteCcy
* state
* tickSz
* lotSz
* minSz
* listTime

normalized output：

```json
{
  "success": true,
  "source": "OKX",
  "type": "instruments",
  "items": [
    {
      "instId": "BTC-USDT",
      "instType": "SPOT",
      "baseCcy": "BTC",
      "quoteCcy": "USDT",
      "state": "live",
      "tickSz": "0.1",
      "lotSz": "0.00000001",
      "minSz": "0.00001",
      "listTime": "1606468572000"
    }
  ]
}
```

用途：

* 股票設定頁選 OKX 時，可確認交易對是否存在
* 未來 ESP32 設定 BTC-USDT / ETH-USDT 時，可查 state 是否 live

---

## 7.3 OKX Ticker API

因為 instruments API 不是價格 API，所以請另外預留 ticker provider：

```txt
lib/market/providers/okx-ticker.ts
```

Endpoint：

```txt
https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT
```

Route：

```http
GET /api/provider/okx/ticker?instId=BTC-USDT
```

實作需求：

* fetch ticker
* normalize 成 MarketData
* 如果 ticker fetch 失敗，fallback demo

常用欄位可以依 OKX 回傳處理：

* instId
* last
* open24h
* high24h
* low24h
* vol24h
* ts

changePercent 計算：

```txt
change = last - open24h
changePercent = change / open24h * 100
```

---

## 7.4 Demo Provider

請建立：

```txt
lib/market/providers/demo.ts
```

用途：

* 本地開發
* 比賽展示
* TWSE / OKX API 錯誤時 fallback

Demo 資料必須完整可用。

---

# 8. API 規格

## 8.1 Public Market API

```http
GET /api/public/market
```

Response：

```json
{
  "success": true,
  "updatedAt": "2026-05-29T13:30:08+08:00",
  "marketMood": "calm",
  "items": [
    {
      "symbol": "2330",
      "market": "TWSE",
      "displayName": "TSMC",
      "price": 1075,
      "change": 19,
      "changePercent": 1.8,
      "tradeTime": "13:30",
      "status": "up_alert",
      "source": "DEMO"
    }
  ]
}
```

---

## 8.2 Device Config API

```http
GET /api/device/config
```

MVP 先不要求 token，但要接受 header：

```http
Authorization: Bearer DEVICE_TOKEN
```

Response：

```json
{
  "success": true,
  "bound": true,
  "mode": "user",
  "device": {
    "deviceCode": "ML-8F3A2C",
    "deviceName": "Market Light Desk",
    "lastSeenAt": "2026-05-29T13:30:08+08:00"
  },
  "settings": {
    "brightness": 80,
    "quietMode": false,
    "buzzerEnabled": true,
    "updateInterval": 30000,
    "rotateInterval": 45000,
    "demoMode": false
  },
  "pet": {
    "petName": "小韭菜",
    "petEnabled": true,
    "level": 1,
    "exp": 0,
    "mood": "normal",
    "animationStyle": "simple"
  },
  "stocks": [
    {
      "symbol": "2330",
      "market": "TWSE",
      "displayName": "TSMC",
      "displayOrder": 0,
      "enabled": true
    }
  ]
}
```

---

## 8.3 Device Market API

```http
GET /api/device/market
```

Response：

```json
{
  "success": true,
  "updatedAt": "2026-05-29T13:30:08+08:00",
  "items": [
    {
      "symbol": "2330",
      "market": "TWSE",
      "displayName": "TSMC",
      "price": 1075.0,
      "yesterday": 1056.0,
      "change": 19.0,
      "changePercent": 1.8,
      "high": 1080.0,
      "low": 1055.0,
      "volume": 23456,
      "tradeTime": "13:30",
      "status": "up_alert",
      "message": "Momentum strong"
    }
  ]
}
```

---

## 8.4 Demo API

```http
GET /api/device/demo?state=up_alert
```

state 支援：

```txt
calm
up
up_alert
down
down_alert
error
closed
quiet
```

---

## 8.5 Device Heartbeat API

```http
POST /api/device/heartbeat
```

Request：

```json
{
  "deviceCode": "ML-8F3A2C",
  "firmwareVersion": "0.1.0",
  "wifiRssi": -55,
  "freeHeap": 180000
}
```

---

## 8.6 Device Event API

```http
POST /api/device/event
```

Request：

```json
{
  "deviceCode": "ML-8F3A2C",
  "eventType": "button_next",
  "message": "Next stock"
}
```

---

# 9. Market Status 規則

請建立：

```txt
lib/market-status.ts
```

type：

```ts
export type MarketStatus =
  | "calm"
  | "up"
  | "up_alert"
  | "down"
  | "down_alert"
  | "error"
  | "closed"
  | "quiet";
```

判斷規則：

```txt
apiError -> error
marketClosed -> closed
abs(changePercent) < 0.5 -> calm
changePercent >= 1.5 -> up_alert
changePercent > 0 -> up
changePercent <= -1.5 -> down_alert
changePercent < 0 -> down
```

Pet face：

```txt
calm -> (-_-)
up -> (^_^)
up_alert -> (^o^)
down -> (._.)
down_alert -> (T_T)
error -> (?)
closed -> (-_-)zZ
quiet -> (-_-)
```

---

# 10. Components

請建立：

```txt
components/
  oled-preview.tsx
  rgb-status.tsx
  pet-face.tsx
  market-card.tsx
  status-badge.tsx
  device-card.tsx
  copy-json-button.tsx
  dashboard-shell.tsx
  sidebar.tsx
  setting-row.tsx
  terminal-panel.tsx
  cyber-card.tsx
```

## OLEDPreview

props：

```ts
type OLEDPreviewProps = {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  status?: MarketStatus;
};
```

OLED 風格：

* 黑底
* cyan 或 green 單色字
* monospace
* 顯示 4 行
* 模擬 128x64 OLED
* 可加入低透明 scanline

---

# 11. Seed Data

請建立 seed：

User：

```txt
email: demo@marketlight.local
password: demo1234
displayName: Demo User
```

Device：

```txt
deviceCode: ML-8F3A2C
deviceName: Market Light Desk
isBound: true
```

Settings：

```txt
brightness: 80
quietMode: false
buzzerEnabled: true
updateInterval: 30000
rotateInterval: 45000
demoMode: false
```

Stocks：

```txt
2330 TWSE TSMC
2317 TWSE HONHAI
2454 TWSE MediaTek
0050 TWSE ETF 0050
BTC-USDT OKX BTC
ETH-USDT OKX ETH
```

Pet：

```txt
petName: 小韭菜
level: 1
exp: 0
mood: normal
```

---

# 12. 檔案結構

請使用：

```txt
app/
  page.tsx
  market/page.tsx
  demo/page.tsx
  login/page.tsx
  register/page.tsx
  dashboard/layout.tsx
  dashboard/page.tsx
  dashboard/device/page.tsx
  dashboard/bind/page.tsx
  dashboard/stocks/page.tsx
  dashboard/pet/page.tsx
  dashboard/api-debug/page.tsx
  api/
    public/market/route.ts
    device/config/route.ts
    device/market/route.ts
    device/heartbeat/route.ts
    device/event/route.ts
    device/demo/route.ts
    provider/twse/route.ts
    provider/okx/instruments/route.ts
    provider/okx/ticker/route.ts
    web/stocks/route.ts
    web/settings/route.ts
    web/pet/route.ts

components/
  oled-preview.tsx
  rgb-status.tsx
  pet-face.tsx
  market-card.tsx
  status-badge.tsx
  device-card.tsx
  copy-json-button.tsx
  dashboard-shell.tsx
  sidebar.tsx
  setting-row.tsx
  terminal-panel.tsx
  cyber-card.tsx

lib/
  prisma.ts
  demo-data.ts
  market-status.ts
  auth-mock.ts
  market/
    providers/
      demo.ts
      twse.ts
      okx-instruments.ts
      okx-ticker.ts
    normalize.ts

prisma/
  schema.prisma
  seed.ts
```

---

# 13. Dashboard 操作要求

MVP 階段設定要能被修改。

股票設定頁至少要完成：

* 新增
* 刪除
* enable / disable
* up / down 排序

裝置設定頁至少要完成：

* quietMode toggle
* demoMode toggle
* brightness slider
* buzzerEnabled toggle

桌寵設定頁至少要完成：

* petName input
* petEnabled toggle
* mood selector

---

# 14. ESP32 後續銜接規格

本階段不寫 ESP32 code，但 README 要寫清楚：

ESP32 之後會呼叫：

```txt
GET /api/device/config
GET /api/device/market
POST /api/device/heartbeat
POST /api/device/event
```

ESP32 三顆 Button 未來規劃：

```txt
Button 1：上一支股票
Button 2：下一支股票
Button 3：詳細資訊 / 確認
Button 3 長按：Quiet Mode
Button 1 + Button 2 長按：Demo Mode
Button 1 + Button 3 長按：重新同步設定
Button 2 + Button 3 長按：顯示裝置碼
```

硬體腳位先記錄於 README：

```txt
OLED SDA -> GPIO 21
OLED SCL -> GPIO 22
Button Prev -> GPIO 18
Button Next -> GPIO 23
Button OK -> GPIO 32
RGB R -> GPIO 25
RGB G -> GPIO 26
RGB B -> GPIO 27
Buzzer -> GPIO 19
```

---

# 15. README 要求

請建立 README.md，包含：

```txt
專案介紹
功能列表
技術棧
安裝方式
啟動方式
資料庫初始化
Seed data
測試帳號
主要頁面
API 文件
TWSE API 說明
OKX instruments API 說明
OKX ticker API 說明
Demo API 使用方式
ESP32 後續串接方式
部署到 Vercel 的步驟
ngrok 測試方式
常見問題
```

---

# 16. 驗收標準

## 網站

* `/` 可以看到 cyberpunk 風格首頁
* `/market` 可以看到市場資料
* `/demo` 可以切換 OLED / RGB / Pet 狀態
* `/login` 可以登入 demo user
* `/dashboard` 可以看到裝置總覽
* `/dashboard/device` 可以修改裝置設定 UI
* `/dashboard/stocks` 可以管理股票清單
* `/dashboard/pet` 可以修改桌寵設定 UI
* `/dashboard/api-debug` 可以查看 API JSON

## API

以下 endpoint 必須正常回傳 JSON：

```txt
GET /api/public/market
GET /api/device/config
GET /api/device/market
GET /api/device/demo?state=up_alert
POST /api/device/heartbeat
POST /api/device/event
GET /api/provider/twse?symbol=2330
GET /api/provider/okx/instruments?instType=SPOT
GET /api/provider/okx/ticker?instId=BTC-USDT
```

## UI

* 要有 cyberpunk / terminal / neon 感
* 不要整頁太閃
* 不要讓字太難讀
* OLED Preview 要像真裝置
* Demo 頁要適合比賽現場展示

## 程式品質

* TypeScript 不要有明顯型別錯誤
* npm run dev 可執行
* Prisma migrate 可執行
* seed 可執行
* API route 不可 crash
* 沒資料時要有 fallback
* 錯誤時回傳 `{ success: false, message: "..." }`

---

# 17. 開發方式要求

請依序完成：

1. 建立 Next.js 專案結構
2. 建立 cyberpunk theme 與基本 layout
3. 建立 demo data
4. 建立首頁、market、demo
5. 建立 dashboard shell
6. 建立 Prisma schema 與 seed
7. 建立 API routes
8. 建立 TWSE / OKX provider routes
9. 建立 dashboard device/stocks/pet pages
10. 建立 api-debug page
11. 建立 README
12. 最後檢查 npm run dev、TypeScript、API JSON

每完成一階段，請確認沒有破壞前一階段。

---

# 18. 重要限制

不要做：

* 真正 OAuth
* WebSocket
* 真正 AI 分析
* 金流
* 正式多使用者權限系統
* ESP32 Arduino code

要做：

* 可展示網站
* 可用 API
* 可 fallback demo
* 可給 ESP32 後續串接

---

# 19. 最終目標

請完成一個可以展示的 Market Light 網站 MVP：

```txt
一個 cyberpunk terminal 風格的低干擾市場桌寵 IoT Dashboard。
使用者可以看市場資料、模擬 ESP32 OLED、設定裝置、設定股票清單、設定市場小助手。
後續 ESP32 可直接透過 Device API 串接。
```

請開始實作。

````

---

我建議你貼給 Codex 後，第一句再補一句：

```text
先完成 Phase 1，不要先做 Prisma，先確保頁面和 UI 風格成功。
````


[1]: https://www.okx.com/docs-v5/en/?utm_source=chatgpt.com "OKX API guide | OKX technical support"
