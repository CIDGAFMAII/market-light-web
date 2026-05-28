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

const defaultItems: WatchItem[] = [
  createItem("TWSE", "2330", "TSMC", "tse"),
  createItem("OKX", "BTC-USDT", "BTC", "tse"),
];

export function WatchlistClient() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [market, setMarket] = useState<WatchMarket>("TWSE");
  const [symbol, setSymbol] = useState("2330");
  const [displayName, setDisplayName] = useState("TSMC");
  const [exchange, setExchange] = useState<"tse" | "otc">("tse");
  const [loadingId, setLoadingId] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    setItems(raw ? JSON.parse(raw) : defaultItems);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, loaded]);

  const deviceSymbols = useMemo(
    () =>
      items
        .filter((item) => item.enabled && item.syncToDevice)
        .map((item) => `${item.market}:${item.symbol}`)
        .join(","),
    [items],
  );

  function addItem() {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) return;

    setItems((current) => [
      ...current,
      createItem(market, cleanSymbol, displayName.trim() || cleanSymbol, exchange),
    ]);
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

  return (
    <main className="min-h-screen terminal-grid px-5 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/market" className="text-sm uppercase tracking-[0.18em] text-cyan">← 市場看盤</Link>
            <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">自選股</h1>
            <p className="mt-3 text-muted">使用 localStorage 管理自選清單，暫不寫入資料庫。</p>
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
              <option value="TWSE">TWSE</option>
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
        </TerminalPanel>

        <section className="mt-5">
          <TerminalPanel title="清單管理" label={`${items.length} ITEMS`}>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="rounded border border-cyan/10 bg-black/25 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr] lg:items-center">
                    <div>
                      <div className="font-orbitron text-lg text-white">{item.symbol}</div>
                      <div className="text-sm text-muted">{item.displayName} / {item.market}{item.market === "TWSE" ? ` / ${item.exchange}` : ""}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => updateItem(item.id, { enabled: !item.enabled })} className={`rounded border px-3 py-2 text-sm ${item.enabled ? "border-green-500/40 text-green-300" : "border-gray-500/40 text-muted"}`}>
                        {item.enabled ? "已啟用" : "已停用"}
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { syncToDevice: !item.syncToDevice })} className={`rounded border px-3 py-2 text-sm ${item.syncToDevice ? "border-cyan/40 text-cyan" : "border-gray-500/40 text-muted"}`}>
                        {item.syncToDevice ? "同步 ESP32" : "不同步"}
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
                </div>
              ))}
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="Device symbols query" label="ESP32">
            <div className="break-all rounded border border-white/10 bg-black/35 p-3 text-sm text-cyan">
              /api/device/market?symbols={deviceSymbols || "尚未選擇同步商品"}
            </div>
            <div className="mt-3 flex justify-end">
              <CopyJsonButton value={{ symbols: deviceSymbols }} />
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
