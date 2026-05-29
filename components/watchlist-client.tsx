"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "./status-badge";
import { TerminalPanel } from "./terminal-panel";

type WatchMarket = "TWSE" | "OKX";

type WatchItem = {
  id: string;
  market: WatchMarket;
  symbol: string;
  displayName: string;
  exchange: "tse" | "otc";
  enabled: boolean;
  syncToDevice: boolean;
  validation?: {
    ok: boolean;
    message: string;
    json?: unknown;
  };
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

const storageKey = "market-light-watchlist-v1";
const defaultDeviceId = "ML-ESP32-DEMO";

const defaultItems: WatchItem[] = [
  createItem("OKX", "ETH-USDT", "ETH", "tse"),
  createItem("TWSE", "2330", "TSMC", "tse"),
];

export function WatchlistClient() {
  const [items, setItems] = useState<WatchItem[]>(defaultItems);
  const [loaded, setLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [market, setMarket] = useState<WatchMarket>("OKX");
  const [symbol, setSymbol] = useState("BTC-USDT");
  const [displayName, setDisplayName] = useState("BTC");
  const [deviceId, setDeviceId] = useState(defaultDeviceId);
  const [loadingId, setLoadingId] = useState("");
  const [savingDevice, setSavingDevice] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    setOrigin(window.location.origin);
    try {
      setItems(raw ? JSON.parse(raw) : defaultItems);
    } catch {
      setItems(defaultItems);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, loaded]);

  const deviceSyncItems = useMemo(
    () => items.filter((item) => item.syncToDevice),
    [items],
  );
  const deviceSymbolList = useMemo(
    () => deviceSyncItems.map((item) => `${item.market}:${item.symbol}`),
    [deviceSyncItems],
  );
  const deviceSymbols = deviceSymbolList.join(",");
  const deviceQueryUrl = deviceSymbols && origin ? `${origin}/api/device/market?symbols=${encodeURIComponent(deviceSymbols)}` : "";
  const fixedDeviceMarketUrl = origin && deviceId.trim()
    ? `${origin}/api/device/market?deviceId=${encodeURIComponent(deviceId.trim())}`
    : "";
  const fixedDeviceConfigUrl = origin && deviceId.trim()
    ? `${origin}/api/device/config?deviceId=${encodeURIComponent(deviceId.trim())}`
    : "";

  function addItem() {
    const cleanSymbol = symbol.trim().toUpperCase();
    const cleanDisplayName = displayName.trim() || cleanSymbol;

    if (!cleanSymbol) {
      setNotice({ tone: "error", message: "請先輸入資產代號。" });
      return;
    }

    if (market === "TWSE" && !/^\d+$/.test(cleanSymbol)) {
      setNotice({ tone: "error", message: "TWSE Demo 代號必須是數字，例如 2330。" });
      return;
    }

    if (market === "OKX" && !/^[A-Z0-9]+-[A-Z0-9]+$/.test(cleanSymbol)) {
      setNotice({ tone: "error", message: "OKX 代號格式需像 BTC-USDT。" });
      return;
    }

    if (items.some((item) => item.market === market && item.symbol === cleanSymbol)) {
      setNotice({ tone: "error", message: `${market}:${cleanSymbol} 已在清單中。` });
      return;
    }

    setItems((current) => [
      ...current,
      createItem(market, cleanSymbol, cleanDisplayName, "tse"),
    ]);
    setNotice({ tone: "success", message: "已新增到自選資產，可到市場看盤的『我的自選』查看。" });
  }

  function updateItem(id: string, patch: Partial<WatchItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function resetItems() {
    setItems(defaultItems.map((item) => ({ ...item, id: createItemId(item.market, item.symbol) })));
    setNotice({ tone: "success", message: "已恢復預設清單。" });
  }

  async function validate(item: WatchItem) {
    setLoadingId(item.id);
    const endpoint =
      item.market === "OKX"
        ? `/api/provider/okx/instruments?instType=SPOT&instId=${encodeURIComponent(item.symbol)}`
        : `/api/provider/twse?symbol=${encodeURIComponent(item.symbol)}&exchange=${item.exchange}`;

    try {
      const response = await fetch(endpoint);
      const json = await response.json();
      const ok =
        item.market === "OKX"
          ? Boolean(json.success && json.items?.[0]?.state === "live")
          : Boolean(json.success);

      updateItem(item.id, {
        validation: {
          ok,
          message: ok ? "Valid / Live" : json.message || json.providerMessage || "Validation failed",
          json,
        },
      });
    } catch (error) {
      updateItem(item.id, {
        validation: {
          ok: false,
          message: error instanceof Error ? error.message : "Validation failed",
        },
      });
    } finally {
      setLoadingId("");
    }
  }

  async function saveToDevice() {
    const cleanDeviceId = deviceId.trim();
    if (!cleanDeviceId) {
      setNotice({ tone: "error", message: "請先輸入 Device ID。" });
      return;
    }

    setSavingDevice(true);
    try {
      const response = await fetch("/api/device/sync-symbols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: cleanDeviceId,
          syncSymbols: deviceSymbolList,
        }),
      });
      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Save to ESP32 Device failed");
      }

      setNotice({ tone: "success", message: "已更新 ESP32 顯示清單。" });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Save to ESP32 Device failed",
      });
    } finally {
      setSavingDevice(false);
    }
  }

  async function copyDeviceUrl() {
    if (!deviceQueryUrl) return;
    await navigator.clipboard.writeText(deviceQueryUrl);
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 1400);
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl">
        <div className="page-header">
          <div>
            <Link href="/market" className="back-link">← 市場看盤</Link>
            <h1 className="page-title">自選資產</h1>
            <p className="page-copy">選擇要出現在市場看盤與 ESP32 上的資產。</p>
          </div>
          <StatusBadge status="calm" />
        </div>

        {notice ? (
          <div className={`mb-5 rounded-xl border p-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}>
            {notice.message}
          </div>
        ) : null}

        <TerminalPanel title="新增資產" label="ADD">
          <div className="grid gap-3 md:grid-cols-[0.8fr_1fr_1fr_auto]">
            <select
              className="field"
              value={market}
              onChange={(event) => {
                const next = event.target.value as WatchMarket;
                setMarket(next);
                setSymbol(next === "OKX" ? "BTC-USDT" : "2330");
                setDisplayName(next === "OKX" ? "BTC" : "TSMC");
              }}
            >
              <option value="OKX">OKX</option>
              <option value="TWSE">TWSE Demo</option>
            </select>
            <input className="field" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder={market === "OKX" ? "BTC-USDT" : "2330"} />
            <input className="field" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="displayName" />
            <button type="button" onClick={addItem} className="btn-primary">
              Add Asset
            </button>
          </div>
        </TerminalPanel>

        <section className="mt-5">
          <TerminalPanel title="資產列表" label={`${items.length} ITEMS`}>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="soft-card p-4 transition duration-200 hover:border-slate-600/60">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1.1fr_auto] lg:items-center">
                    <div>
                      <div className="font-mono text-lg font-bold text-slate-50">{item.symbol}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-300">
                        <span>{item.displayName}</span>
                        <span className="badge border-indigo-400/25 bg-indigo-500/10 text-indigo-200">{formatMarket(item.market)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button type="button" onClick={() => updateItem(item.id, { syncToDevice: !item.syncToDevice })} className={`btn-secondary ${item.syncToDevice ? "border-indigo-400/35 bg-indigo-500/10 text-indigo-100" : ""}`}>
                        顯示於 ESP32：{item.syncToDevice ? "是" : "否"}
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { enabled: !item.enabled })} className={`btn-secondary ${item.enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : ""}`}>
                        顯示在看盤：{item.enabled ? "是" : "否"}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeItem(item.id)} className="btn-danger">刪除</button>
                    </div>
                  </div>
                  <details className="mt-3 text-xs text-slate-400">
                    <summary className="cursor-pointer hover:text-indigo-200">進階</summary>
                    <div className="mt-3 rounded-xl border border-slate-700/70 bg-slate-950/75 p-3">
                      <div>驗證狀態：<span className={item.validation ? (item.validation.ok ? "text-emerald-200" : "text-amber-200") : "text-slate-400"}>{item.validation ? item.validation.message : "尚未驗證"}</span></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => validate(item)} disabled={loadingId === item.id} className="btn-secondary disabled:cursor-wait">
                          {loadingId === item.id ? "驗證中" : item.market === "OKX" ? "驗證 OKX" : "測試 TWSE"}
                        </button>
                        {item.market === "TWSE" ? <span className="badge">TWSE Demo</span> : null}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="ESP32 顯示清單" label={`${deviceSyncItems.length} ASSETS`}>
            <div className="soft-card p-4">
              <div className="mb-3 text-sm text-slate-400">
                目前會顯示 {deviceSyncItems.length} 個資產：
              </div>
              {deviceSyncItems.length > 0 ? (
                <ul className="space-y-2 font-mono text-sm text-indigo-200">
                  {deviceSyncItems.map((item) => (
                    <li key={item.id} className="rounded-lg border border-slate-700/70 bg-slate-950/80 px-3 py-2">
                      {item.symbol}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-slate-700/70 bg-slate-950/75 p-3 text-sm text-slate-300">
                  尚未選擇資產
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={saveToDevice}
                  disabled={savingDevice}
                  className="btn-primary disabled:cursor-wait"
                >
                  {savingDevice ? "儲存中" : "儲存到 ESP32"}
                </button>
              </div>
            </div>
          </TerminalPanel>
        </section>

        <details className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-950/70 p-4 text-sm text-slate-400">
          <summary className="cursor-pointer font-semibold hover:text-indigo-200">開發者資訊</summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              Device ID
              <input
                className="field"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
                placeholder={defaultDeviceId}
              />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <button type="button" onClick={resetItems} className="btn-secondary">
                Reset watchlist
              </button>
              <button
                type="button"
                onClick={copyDeviceUrl}
                disabled={!deviceQueryUrl}
                className="btn-secondary"
              >
                {copiedUrl ? "已複製" : "複製 API URL"}
              </button>
            </div>
            <InfoLine label="Device market URL" value={fixedDeviceMarketUrl || "請輸入 Device ID"} />
            <InfoLine label="Device config URL" value={fixedDeviceConfigUrl || "請輸入 Device ID"} />
            <InfoLine label="Symbols URL" value={deviceQueryUrl || "尚未選擇資產"} />
            <InfoLine label="Symbols" value={deviceSymbols || "尚未選擇資產"} />
            <div className="flex flex-wrap gap-3 lg:col-span-2">
              {fixedDeviceMarketUrl ? (
                <a href={fixedDeviceMarketUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                  Open Device API
                </a>
              ) : null}
              {fixedDeviceConfigUrl ? (
                <a href={fixedDeviceConfigUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                  Open Config API
                </a>
              ) : null}
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/80 p-3">
      <div className="mb-2 text-xs font-semibold text-slate-400">{label}</div>
      <div className="break-all font-mono text-indigo-200">{value}</div>
    </div>
  );
}

function createItemId(market: WatchMarket, symbol: string) {
  return `${market}:${symbol}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}

function formatMarket(market: WatchMarket) {
  return market === "TWSE" ? "TWSE Demo" : "OKX";
}

function createItem(market: WatchMarket, symbol: string, displayName: string, exchange: "tse" | "otc"): WatchItem {
  return {
    id: createItemId(market, symbol),
    market,
    symbol,
    displayName,
    exchange,
    enabled: true,
    syncToDevice: true,
  };
}
