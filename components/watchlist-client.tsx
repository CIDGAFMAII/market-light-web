"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CopyJsonButton } from "./copy-json-button";
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

const storageKey = "market-light-watchlist-v1";
const defaultDeviceId = "ML-ESP32-DEMO";

const defaultItems: WatchItem[] = [
  createItem("TWSE", "2330", "TSMC", "tse"),
  createItem("OKX", "BTC-USDT", "BTC", "tse"),
];

type Notice = {
  tone: "success" | "error";
  message: string;
};

export function WatchlistClient() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [market, setMarket] = useState<WatchMarket>("OKX");
  const [symbol, setSymbol] = useState("BTC-USDT");
  const [displayName, setDisplayName] = useState("BTC");
  const [exchange, setExchange] = useState<"tse" | "otc">("tse");
  const [loadingId, setLoadingId] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deviceId, setDeviceId] = useState(defaultDeviceId);
  const [savingDevice, setSavingDevice] = useState(false);

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
    () =>
      items.filter((item) => item.enabled && item.syncToDevice),
    [items],
  );
  const deviceSymbolList = useMemo(
    () => deviceSyncItems.map((item) => `${item.market}:${item.symbol}`),
    [deviceSyncItems],
  );
  const deviceSymbols = deviceSymbolList.join(",");
  const deviceQueryUrl = deviceSymbols && origin ? `${origin}/api/device/market?symbols=${deviceSymbols}` : "";
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
      setNotice({ tone: "error", message: "請先輸入商品代號。" });
      return;
    }

    if (market === "TWSE" && !/^\d+$/.test(cleanSymbol)) {
      setNotice({ tone: "error", message: "TWSE symbol 必須是數字，例如 2330。" });
      return;
    }

    if (market === "OKX" && !/^[A-Z0-9]+-[A-Z0-9]+$/.test(cleanSymbol)) {
      setNotice({ tone: "error", message: "OKX symbol 必須像 BTC-USDT。" });
      return;
    }

    if (items.some((item) => item.market === market && item.symbol === cleanSymbol)) {
      setNotice({ tone: "error", message: `${market}:${cleanSymbol} 已在自選清單中。` });
      return;
    }

    setItems((current) => [
      ...current,
      createItem(market, cleanSymbol, cleanDisplayName, exchange),
    ]);
    setNotice({ tone: "success", message: `已新增 ${market}:${cleanSymbol}。` });
  }

  function resetItems() {
    setItems(defaultItems.map((item) => ({ ...item, id: `${item.market}:${item.symbol}:${Date.now()}:${Math.random().toString(16).slice(2)}` })));
    setNotice({ tone: "success", message: "已恢復預設自選清單。" });
  }

  function updateItem(id: string, patch: Partial<WatchItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
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

  async function copyDeviceUrl() {
    if (!deviceQueryUrl) return;
    await navigator.clipboard.writeText(deviceQueryUrl);
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 1400);
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

      setNotice({
        tone: "success",
        message: json.warning ? `已儲存到 ESP32 設定：${json.warning}` : "已儲存到 ESP32 設定。",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Save to ESP32 Device failed",
      });
    } finally {
      setSavingDevice(false);
    }
  }

  return (
    <main className="min-h-screen terminal-grid px-5 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/market" className="text-sm uppercase tracking-[0.18em] text-cyan">← 市場看盤</Link>
            <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">自選股</h1>
            <p className="mt-3 text-muted">
              在這裡選擇要同步到 ESP32 的股票或資產。使用 localStorage 管理自選清單，暫不寫入資料庫。
            </p>
            <p className="mt-2 text-sm text-yellow">
              競賽展示建議使用 OKX 加密貨幣。台股目前為 Demo 展示資料。
            </p>
          </div>
          <StatusBadge status="calm" />
        </div>

        <TerminalPanel title="新增商品" label="LOCAL">
          <div className="grid gap-3 md:grid-cols-5">
            <select className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={market} onChange={(event) => {
              const next = event.target.value as WatchMarket;
              setMarket(next);
              setSymbol(next === "OKX" ? "BTC-USDT" : "2330");
              setDisplayName(next === "OKX" ? "BTC" : "TSMC");
            }}>
              <option value="TWSE">TWSE Experimental / Demo</option>
              <option value="OKX">OKX</option>
            </select>
            <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder={market === "OKX" ? "BTC-USDT" : "2330"} />
            <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="displayName" />
            <select className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan disabled:opacity-40" value={exchange} onChange={(event) => setExchange(event.target.value as "tse" | "otc")} disabled={market === "OKX"}>
              <option value="tse">tse</option>
              <option value="otc">otc</option>
            </select>
            <button type="button" onClick={addItem} className="rounded border border-[var(--border-cyan)] px-4 py-2 text-cyan hover:bg-cyan/10">
              新增
            </button>
          </div>
          {notice ? (
            <div className={`mt-4 rounded border p-3 text-sm ${
              notice.tone === "success"
                ? "border-green-500/40 bg-green-500/10 text-green-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}>
              {notice.message}
            </div>
          ) : null}
        </TerminalPanel>

        <section className="mt-5">
          <TerminalPanel title="清單管理" label={`${items.length} ITEMS`}>
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={resetItems} className="rounded border border-yellow-400/40 px-3 py-2 text-sm text-yellow hover:bg-yellow/10">
                Reset watchlist
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="rounded border border-cyan/10 bg-black/25 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr] lg:items-center">
                    <div>
                      <div className="font-orbitron text-lg text-white">{item.symbol}</div>
                      <div className="mt-1 grid gap-1 text-sm text-muted sm:grid-cols-2">
                        <span>market：<span className="text-cyan">{item.market}</span></span>
                        <span>symbol：<span className="text-white">{item.symbol}</span></span>
                        <span>displayName：<span className="text-white">{item.displayName}</span></span>
                        <span>validation：<span className={item.validation ? (item.validation.ok ? "text-green-300" : "text-yellow") : "text-muted"}>{item.validation ? item.validation.message : "尚未驗證"}</span></span>
                      </div>
                      {item.market === "TWSE" ? <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">exchange：{item.exchange}</div> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => updateItem(item.id, { enabled: !item.enabled })} className={`rounded border px-3 py-2 text-sm ${item.enabled ? "border-green-500/40 text-green-300" : "border-gray-500/40 text-muted"}`}>
                        enabled: {item.enabled ? "true" : "false"}
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { syncToDevice: !item.syncToDevice })} className={`rounded border px-3 py-2 text-sm ${item.syncToDevice ? "border-cyan/40 text-cyan" : "border-gray-500/40 text-muted"}`}>
                        syncToDevice: {item.syncToDevice ? "true" : "false"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => moveItem(item.id, -1)} disabled={index === 0} className="rounded border border-white/10 px-3 py-2 text-muted hover:border-cyan/40 hover:text-cyan disabled:opacity-30">上移</button>
                      <button type="button" onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1} className="rounded border border-white/10 px-3 py-2 text-muted hover:border-cyan/40 hover:text-cyan disabled:opacity-30">下移</button>
                      <button type="button" onClick={() => removeItem(item.id)} className="rounded border border-red-500/40 px-3 py-2 text-red-300 hover:bg-red-500/10">刪除</button>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button type="button" onClick={() => validate(item)} disabled={loadingId === item.id} className="rounded border border-[var(--border-yellow)] px-3 py-2 text-yellow hover:bg-yellow/10 disabled:cursor-wait disabled:opacity-60">
                        {loadingId === item.id ? "驗證中" : item.market === "OKX" ? "Validate OKX Instrument" : "Test TWSE"}
                      </button>
                      <Link href={`/market/${item.market}/${encodeURIComponent(item.symbol)}`} className="rounded border border-[var(--border-cyan)] px-3 py-2 text-cyan hover:bg-cyan/10">
                        詳情
                      </Link>
                    </div>
                  </div>
                  {item.validation ? (
                    <div className={`mt-3 rounded border p-3 text-sm ${item.validation.ok ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-yellow-400/40 bg-yellow/10 text-yellow"}`}>
                      {item.validation.message}
                    </div>
                  ) : null}
                  {!item.enabled || !item.syncToDevice ? (
                    <div className="mt-3 rounded border border-white/10 bg-black/25 p-3 text-xs text-muted">
                      {!item.enabled ? "enabled=false，因此不會進入 ESP32 同步 URL。" : "syncToDevice=false，因此不會進入 ESP32 同步 URL。"}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="ESP32 同步清單" label={`${deviceSyncItems.length} SYNC`}>
            <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <div className="rounded border border-cyan/10 bg-black/30 p-4">
                <div className="mb-3 text-sm uppercase tracking-[0.18em] text-muted">
                  目前會同步 {deviceSyncItems.length} 個項目
                </div>
                {deviceSymbolList.length > 0 ? (
                  <div className="space-y-2 font-mono text-sm text-cyan">
                    {deviceSymbolList.map((item) => (
                      <div key={item} className="rounded border border-white/10 bg-black/35 px-3 py-2">
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-white/10 bg-black/35 p-3 text-sm text-muted">
                    尚未選擇同步項目
                  </div>
                )}
              </div>
              <div className="rounded border border-cyan/10 bg-black/30 p-4">
                <div className="mb-3 text-sm uppercase tracking-[0.18em] text-muted">Manual symbols URL</div>
                <div className="break-all rounded border border-white/10 bg-black/35 p-3 text-sm text-cyan">
                  {deviceQueryUrl || "尚未選擇同步項目"}
                </div>
                {deviceSymbols ? (
                  <div className="mt-3 break-all rounded border border-white/10 bg-black/25 p-3 text-xs text-muted">
                    /api/device/market?symbols={deviceSymbols}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={copyDeviceUrl}
                    disabled={!deviceQueryUrl}
                    className="rounded border border-[var(--border-cyan)] px-3 py-2 text-sm uppercase tracking-[0.16em] text-cyan transition hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copiedUrl ? "已複製" : "Copy Device URL"}
                  </button>
                  {deviceQueryUrl ? (
                    <a
                      href={deviceQueryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-[var(--border-pink)] px-3 py-2 text-sm uppercase tracking-[0.16em] text-pink transition hover:bg-pink/10"
                    >
                      Open Device API
                    </a>
                  ) : (
                    <span className="rounded border border-white/10 px-3 py-2 text-sm uppercase tracking-[0.16em] text-muted opacity-50">
                      Open Device API
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <CopyJsonButton value={{ url: deviceQueryUrl, symbols: deviceSymbolList }} />
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="Save to ESP32 Device" label="DEVICE ID">
            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr]">
              <div className="rounded border border-cyan/10 bg-black/30 p-4">
                <label className="grid gap-2 text-sm text-muted">
                  Device ID
                  <input
                    className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan"
                    value={deviceId}
                    onChange={(event) => setDeviceId(event.target.value)}
                    placeholder={defaultDeviceId}
                  />
                </label>
                <button
                  type="button"
                  onClick={saveToDevice}
                  disabled={savingDevice}
                  className="mt-4 w-full rounded border border-[var(--border-yellow)] px-4 py-2 text-sm uppercase tracking-[0.16em] text-yellow transition hover:bg-yellow/10 disabled:cursor-wait disabled:opacity-60"
                >
                  {savingDevice ? "Saving" : "Save to ESP32 Device"}
                </button>
                <div className="mt-3 rounded border border-white/10 bg-black/25 p-3 text-xs leading-5 text-muted">
                  這會把目前 enabled=true 且 syncToDevice=true 的清單儲存到 server-side device config。
                </div>
              </div>
              <div className="rounded border border-cyan/10 bg-black/30 p-4">
                <div className="mb-3 text-sm uppercase tracking-[0.18em] text-muted">ESP32 fixed API URL</div>
                <div className="break-all rounded border border-white/10 bg-black/35 p-3 text-sm text-cyan">
                  {fixedDeviceMarketUrl || "請輸入 Device ID"}
                </div>
                <div className="mt-3 rounded border border-white/10 bg-black/25 p-3 text-xs leading-5 text-muted">
                  這條 URL 固定不變，資產清單會從 server-side device config 讀取。
                </div>
                <div className="mt-3 break-all rounded border border-white/10 bg-black/25 p-3 text-xs text-muted">
                  Config URL：{fixedDeviceConfigUrl || "請輸入 Device ID"}
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  {fixedDeviceMarketUrl ? (
                    <a
                      href={fixedDeviceMarketUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-[var(--border-pink)] px-3 py-2 text-sm uppercase tracking-[0.16em] text-pink transition hover:bg-pink/10"
                    >
                      Open Fixed Device API
                    </a>
                  ) : null}
                  {fixedDeviceConfigUrl ? (
                    <a
                      href={fixedDeviceConfigUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-[var(--border-cyan)] px-3 py-2 text-sm uppercase tracking-[0.16em] text-cyan transition hover:bg-cyan/10"
                    >
                      Open Config API
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}

function createItem(market: WatchMarket, symbol: string, displayName: string, exchange: "tse" | "otc"): WatchItem {
  return {
    id: `${market}:${symbol}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    market,
    symbol,
    displayName,
    exchange,
    enabled: true,
    syncToDevice: true,
  };
}
