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
    <main className="min-h-screen terminal-grid px-5 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/market" className="text-sm uppercase tracking-[0.18em] text-cyan">← 市場看盤</Link>
            <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">自選資產</h1>
            <p className="mt-3 text-muted">選擇要出現在市場看盤與 ESP32 上的資產。</p>
          </div>
          <StatusBadge status="calm" />
        </div>

        {notice ? (
          <div className={`mb-5 rounded border p-3 text-sm ${
            notice.tone === "success"
              ? "border-green-500/40 bg-green-500/10 text-green-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}>
            {notice.message}
          </div>
        ) : null}

        <TerminalPanel title="新增資產" label="ADD">
          <div className="grid gap-3 md:grid-cols-[0.8fr_1fr_1fr_auto]">
            <select
              className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan"
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
            <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder={market === "OKX" ? "BTC-USDT" : "2330"} />
            <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="displayName" />
            <button type="button" onClick={addItem} className="rounded border border-[var(--border-cyan)] px-4 py-2 text-cyan hover:bg-cyan/10">
              Add Asset
            </button>
          </div>
        </TerminalPanel>

        <section className="mt-5">
          <TerminalPanel title="資產列表" label={`${items.length} ITEMS`}>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded border border-cyan/10 bg-black/25 p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1.1fr_auto] lg:items-center">
                    <div>
                      <div className="font-orbitron text-lg text-white">{item.symbol}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted">
                        <span>{item.displayName}</span>
                        <span className="rounded border border-cyan/25 px-2 py-0.5 text-xs text-cyan">{formatMarket(item.market)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button type="button" onClick={() => updateItem(item.id, { syncToDevice: !item.syncToDevice })} className={`rounded border px-3 py-2 text-sm ${item.syncToDevice ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-gray-500/40 text-muted"}`}>
                        顯示於 ESP32：{item.syncToDevice ? "是" : "否"}
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { enabled: !item.enabled })} className={`rounded border px-3 py-2 text-sm ${item.enabled ? "border-green-500/40 text-green-300" : "border-gray-500/40 text-muted"}`}>
                        顯示在看盤：{item.enabled ? "是" : "否"}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeItem(item.id)} className="rounded border border-red-500/40 px-3 py-2 text-red-300 hover:bg-red-500/10">刪除</button>
                    </div>
                  </div>
                  <details className="mt-3 text-xs text-muted">
                    <summary className="cursor-pointer hover:text-cyan">進階</summary>
                    <div className="mt-3 rounded border border-white/10 bg-black/25 p-3">
                      <div>驗證狀態：<span className={item.validation ? (item.validation.ok ? "text-green-300" : "text-yellow") : "text-muted"}>{item.validation ? item.validation.message : "尚未驗證"}</span></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => validate(item)} disabled={loadingId === item.id} className="rounded border border-[var(--border-yellow)] px-3 py-2 text-yellow hover:bg-yellow/10 disabled:cursor-wait disabled:opacity-60">
                          {loadingId === item.id ? "驗證中" : item.market === "OKX" ? "驗證 OKX" : "測試 TWSE"}
                        </button>
                        {item.market === "TWSE" ? <span className="rounded border border-white/10 px-3 py-2">TWSE Demo</span> : null}
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
            <div className="rounded border border-cyan/10 bg-black/30 p-4">
              <div className="mb-3 text-sm text-muted">
                目前會顯示 {deviceSyncItems.length} 個資產：
              </div>
              {deviceSyncItems.length > 0 ? (
                <ul className="space-y-2 font-mono text-sm text-cyan">
                  {deviceSyncItems.map((item) => (
                    <li key={item.id} className="rounded border border-white/10 bg-black/35 px-3 py-2">
                      {item.symbol}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded border border-white/10 bg-black/35 p-3 text-sm text-muted">
                  尚未選擇資產
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={saveToDevice}
                  disabled={savingDevice}
                  className="rounded border border-[var(--border-cyan)] bg-cyan/10 px-5 py-2 text-sm uppercase tracking-[0.16em] text-cyan transition hover:bg-cyan/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {savingDevice ? "儲存中" : "儲存到 ESP32"}
                </button>
              </div>
            </div>
          </TerminalPanel>
        </section>

        <details className="mt-5 rounded border border-white/10 bg-black/20 p-4 text-sm text-muted">
          <summary className="cursor-pointer uppercase tracking-[0.16em] hover:text-cyan">開發者資訊</summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              Device ID
              <input
                className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
                placeholder={defaultDeviceId}
              />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <button type="button" onClick={resetItems} className="rounded border border-yellow-400/40 px-3 py-2 text-yellow hover:bg-yellow/10">
                Reset watchlist
              </button>
              <button
                type="button"
                onClick={copyDeviceUrl}
                disabled={!deviceQueryUrl}
                className="rounded border border-[var(--border-cyan)] px-3 py-2 text-cyan transition hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-40"
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
                <a href={fixedDeviceMarketUrl} target="_blank" rel="noreferrer" className="rounded border border-[var(--border-pink)] px-3 py-2 text-pink hover:bg-pink/10">
                  Open Device API
                </a>
              ) : null}
              {fixedDeviceConfigUrl ? (
                <a href={fixedDeviceConfigUrl} target="_blank" rel="noreferrer" className="rounded border border-[var(--border-cyan)] px-3 py-2 text-cyan hover:bg-cyan/10">
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
    <div className="rounded border border-white/10 bg-black/30 p-3">
      <div className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="break-all font-mono text-cyan">{value}</div>
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
