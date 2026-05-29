# Market Light API 文件

本文件說明前端如何調用後端 API。

**MVP 身分驗證機制 (Mock Auth)**:
目前為 MVP 階段，未引入完整的 Session 或 JWT 機制。
所有需要登入的 API (`/api/web/*`) 必須在 HTTP Header 中帶上 `x-user-id` 來識別使用者。
> 測試時，請在 Header 加入：`x-user-id: clx1a2b3c0000qwer1234abcd` (這是資料庫 seed 中的 Demo User ID)

---

## 1. 公開 API (無需登入)

### 取得市場概況 (Public Market)
前端用於未登入時展示 `/market` 的預設或公開資訊。

- **Endpoint**: `GET /api/public/market`
- **Headers**: 無
- **Response**:
```json
{
  "success": true,
  "updatedAt": "2026-05-29T13:30:08.000Z",
  "marketMood": "calm", // calm | up | up_alert | down | down_alert | error | closed
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

## 2. 使用者自選清單 API (Watchlist)

用於讓不同帳號管理自己要追蹤的項目 (WatchlistItem)，包含專屬的 `display_mode` 和 `trend_period`。

### 取得使用者的自選清單
- **Endpoint**: `GET /api/web/watchlist`
- **Headers**: `x-user-id: <user_id>`
- **Response**:
```json
{
  "success": true,
  "items": [
    {
      "id": "clx...",
      "userId": "clx...",
      "market": "OKX",
      "symbol": "BTC/USDT",
      "displayMode": 1, 
      "trendPeriod": 1440,
      "sortOrder": 0,
      "enabled": true
    }
  ]
}
```

### 新增自選清單項目
- **Endpoint**: `POST /api/web/watchlist`
- **Headers**: `x-user-id: <user_id>`, `Content-Type: application/json`
- **Body**:
```json
{
  "market": "OKX", // 必填 (OKX | TWSE | DEMO)
  "symbol": "ETH/USDT", // 必填
  "displayMode": 2, // 選填 (0=僅ESP32, 1=僅看盤網站, 2=皆可) 預設 2
  "trendPeriod": 60 // 選填 (分鐘數 5 | 15 | 60 | 1440) 預設 1440
}
```
- **Response**:
```json
{
  "success": true,
  "item": { /* 新增的項目物件 */ }
}
```

### 更新自選清單項目
- **Endpoint**: `PUT /api/web/watchlist/[id]`
- **Headers**: `x-user-id: <user_id>`, `Content-Type: application/json`
- **Body** (皆為選填):
```json
{
  "displayMode": 1,
  "trendPeriod": 15,
  "enabled": false,
  "sortOrder": 2
}
```

### 刪除自選清單項目
- **Endpoint**: `DELETE /api/web/watchlist/[id]`
- **Headers**: `x-user-id: <user_id>`

---

## 3. 裝置控制 API (Device)

對應 ESP32 裝置本身的設定與輪播股票清單。

### 取得裝置股票清單 (Device Stocks)
這是專門設定要傳給 ESP32 輪播用的清單。
- **Endpoint**: `GET /api/web/stocks`
- **Headers**: `x-user-id: <user_id>`
- **Response**:
```json
{
  "success": true,
  "stocks": [
    {
      "id": "...",
      "symbol": "2330",
      "market": "TWSE",
      "displayName": "TSMC",
      "displayOrder": 0,
      "enabled": true
    }
  ]
}
```

### 新增裝置股票
- **Endpoint**: `POST /api/web/stocks`
- **Headers**: `x-user-id: <user_id>`, `Content-Type: application/json`
- **Body**:
```json
{
  "symbol": "2330",
  "market": "TWSE",
  "displayName": "TSMC"
}
```

### 更新/刪除裝置股票
- **Endpoint**: `PUT /api/web/stocks/[id]` 或 `DELETE /api/web/stocks/[id]`
- **Headers**: `x-user-id: <user_id>`
- **PUT Body**: `enabled`, `displayOrder`, `displayName` 

---

### 取得/更新裝置設定 (Device Settings)
包含硬體相關參數 (如 OLED 亮度、靜音模式等)。
- **Endpoint**: `GET /api/web/settings` 與 `PUT /api/web/settings`
- **Headers**: `x-user-id: <user_id>`
- **PUT Body** (皆為選填):
```json
{
  "brightness": 80, // 0-100
  "quietMode": false,
  "buzzerEnabled": true,
  "updateInterval": 30000,
  "rotateInterval": 45000,
  "demoMode": false
}
```

---

### 取得/更新桌寵設定 (Pet Settings)
- **Endpoint**: `GET /api/web/pet` 與 `PUT /api/web/pet`
- **Headers**: `x-user-id: <user_id>`
- **PUT Body** (皆為選填):
```json
{
  "petName": "小韭菜",
  "petEnabled": true,
  "mood": "calm", // calm | up | up_alert | down | down_alert | error | closed | quiet
  "animationStyle": "simple", // simple | cute | minimal
  "interactionEnabled": true
}
```

---

## 前端調用範例 (Client Component)

```typescript
// 取得使用者的自選清單
async function fetchMyWatchlist() {
  const userId = localStorage.getItem("ml_auth_user_id") || "clx1a2b3c0000qwer1234abcd";
  
  const res = await fetch("/api/web/watchlist", {
    method: "GET",
    headers: {
      "x-user-id": userId,
    },
  });
  
  const data = await res.json();
  if (data.success) {
    console.log("我的清單:", data.items);
  } else {
    console.error("錯誤:", data.message);
  }
}

// 新增自選清單
async function addToWatchlist(symbol: string, market: string) {
  const userId = localStorage.getItem("ml_auth_user_id") || "clx1a2b3c0000qwer1234abcd";

  const res = await fetch("/api/web/watchlist", {
    method: "POST",
    headers: {
      "x-user-id": userId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symbol,
      market,
      displayMode: 2,
      trendPeriod: 1440
    }),
  });

  const data = await res.json();
  if (data.success) {
    alert("新增成功！");
  } else {
    alert(`新增失敗: ${data.message}`);
  }
}
```
