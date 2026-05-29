"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { statusLabels } from "@/lib/market-status";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";
import type { MarketStatus } from "@/lib/market-status";
import type { MarketData, MarketSource } from "@/lib/market/types";

type MarketResponse = {
  success: boolean;
  updatedAt: string;
  marketMood: MarketStatus;
  sourceMode: string;
  items: MarketData[];
  warnings: string[];
};

type SortKey = "price" | "changePercent" | "volume";
type MarketFilter = "ALL" | "TWSE" | "OKX";
type StatusFilter = "ALL" | "up" | "down" | "up_alert" | "down_alert" | "calm";
type SourceModeSetting = "real" | "demo";
type RefreshInterval = 0 | 10 | 30 | 60;

const sourceModeStorageKey = "market-light-market-source-mode-v1";
const refreshStorageKey = "market-light-market-refresh-sec-v1";

const sourceClass: Record<MarketSource, string> = {
  TWSE: "border-cyan/40 text-cyan",
  OKX: "border-pink/40 text-pink",
  CACHE: "border-yellow/40 text-yellow",
  DEMO: "border-gray-500/40 text-muted",
};

export function MarketBoardClient() {
  const [items, setItems] = useState<MarketData[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [marketMood, setMarketMood] = useState<MarketStatus>("calm");
  const [sourceMode, setSourceMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceModeSetting, setSourceModeSetting] = useState<SourceModeSetting>("real");
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(0);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDesc, setSortDesc] = useState(true);
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = sourceModeSetting === "demo" ? "/api/public/market?demoMode=true" : "/api/public/market";
      const response = await fetch(endpoint, { cache: "no-store" });
      const json = (await response.json()) as MarketResponse;

      if (!json.success) {
        throw new Error("Market API returned success=false");
      }

      setItems(json.items ?? []);
      setWarnings(json.warnings ?? []);
      setUpdatedAt(json.updatedAt);
      setMarketMood(json.marketMood ?? "calm");
      setSourceMode(json.sourceMode);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Market request failed");
    } finally {
      setLoading(false);
    }
  }, [sourceModeSetting]);

  useEffect(() => {
    const savedSourceMode = window.localStorage.getItem(sourceModeStorageKey);
    const savedRefresh = Number(window.localStorage.getItem(refreshStorageKey));

    if (savedSourceMode === "real" || savedSourceMode === "demo") {
      setSourceModeSetting(savedSourceMode);
    }
    if (savedRefresh === 0 || savedRefresh === 10 || savedRefresh === 30 || savedRefresh === 60) {
      setRefreshInterval(savedRefresh);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(sourceModeStorageKey, sourceModeSetting);
    void refresh();
  }, [refresh, sourceModeSetting]);

  useEffect(() => {
    window.localStorage.setItem(refreshStorageKey, String(refreshInterval));

    if (refreshInterval === 0) return undefined;
    const timer = window.setInterval(() => {
      void refresh();
    }, refreshInterval * 1000);

    return () => window.clearInterval(timer);
  }, [refresh, refreshInterval]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items
      .filter((item) => {
        const matchesQuery =
          !normalizedQuery ||
          item.symbol.toLowerCase().includes(normalizedQuery) ||
          item.displayName.toLowerCase().includes(normalizedQuery);
        const matchesMarket = marketFilter === "ALL" || item.market === marketFilter;
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

        return matchesQuery && matchesMarket && matchesStatus;
      })
      .sort((a, b) => {
        const diff = Number(a[sortKey]) - Number(b[sortKey]);
        return sortDesc ? -diff : diff;
      });
  }, [items, marketFilter, query, sortDesc, sortKey, statusFilter]);

  const moodSummary = useMemo(() => {
    const alertCount = items.filter((item) => item.status === "up_alert" || item.status === "down_alert").length;
    const upCount = items.filter((item) => item.changePercent > 0).length;
    const downCount = items.filter((item) => item.changePercent < 0).length;
    return `${statusLabels[marketMood]} / 上漲 ${upCount} / 下跌 ${downCount} / 警示 ${alertCount}`;
  }, [items, marketMood]);

  function updateSourceMode(nextMode: SourceModeSetting) {
    setSourceModeSetting(nextMode);
  }

  function updateRefreshInterval(nextInterval: RefreshInterval) {
    setRefreshInterval(nextInterval);
  }

  return (
    <main className="min-h-screen terminal-grid px-5 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" className="text-sm uppercase tracking-[0.18em] text-cyan">← 首頁</Link>
            <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">市場看盤</h1>
            <p className="mt-3 text-muted">真實 TWSE / OKX 看盤。fallback 只作為資料暫時不可用時的標示。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateSourceMode(sourceModeSetting === "demo" ? "real" : "demo")}
              className={`rounded border px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                sourceModeSetting === "demo"
                  ? "border-yellow-400/45 bg-yellow/10 text-yellow"
                  : "border-white/10 text-muted hover:border-cyan/35 hover:text-cyan"
              }`}
            >
              Demo Mode {sourceModeSetting === "demo" ? "On" : "Off"}
            </button>
            <select
              value={refreshInterval}
              onChange={(event) => updateRefreshInterval(Number(event.target.value) as RefreshInterval)}
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-[0.12em] text-muted"
            >
              <option value={0}>Auto Off</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
            <Link href="/watchlist" className="rounded border border-[var(--border-pink)] px-4 py-2 text-sm uppercase tracking-[0.16em] text-pink hover:bg-pink/10">
              自選股
            </Link>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="rounded border border-[var(--border-cyan)] px-4 py-2 text-sm uppercase tracking-[0.16em] text-cyan hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "更新中" : "Refresh"}
            </button>
          </div>
        </div>

        <TerminalPanel title="看盤控制" label={sourceMode || "REAL"}>
          <div className="grid gap-3 md:grid-cols-5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋 symbol / displayName"
              className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan outline-none placeholder:text-muted"
            />
            <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value as MarketFilter)} className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan">
              <option value="ALL">ALL Market</option>
              <option value="TWSE">TWSE</option>
              <option value="OKX">OKX</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan">
              <option value="ALL">ALL Status</option>
              <option value="up">up</option>
              <option value="down">down</option>
              <option value="up_alert">up_alert</option>
              <option value="down_alert">down_alert</option>
              <option value="calm">calm</option>
            </select>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan">
              <option value="price">依 price 排序</option>
              <option value="changePercent">依 changePercent 排序</option>
              <option value="volume">依 volume 排序</option>
            </select>
            <button type="button" onClick={() => setSortDesc((value) => !value)} className="rounded border border-white/10 px-3 py-2 text-muted hover:border-cyan/40 hover:text-cyan">
              {sortDesc ? "由高到低" : "由低到高"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
            <span>更新時間：{updatedAt ? new Date(updatedAt).toLocaleString("zh-TW") : "尚未更新"}</span>
            <span>顯示：{filteredItems.length} / {items.length}</span>
            <span>狀態摘要：{moodSummary}</span>
            {warnings.length > 0 ? (
              <details className="text-yellow">
                <summary className="cursor-pointer">部分資料暫時使用 fallback</summary>
                <div className="mt-2 max-w-3xl leading-5 text-yellow/90">{warnings.join("；")}</div>
              </details>
            ) : null}
          </div>
          {error ? <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</div> : null}
        </TerminalPanel>

        <section className="mt-5">
          <TerminalPanel title="即時行情" label={loading ? "LOADING" : "LIVE"}>
            {loading && items.length === 0 ? <div className="p-6 text-muted">正在讀取真實資料...</div> : null}
            {!loading && filteredItems.length === 0 ? <div className="p-6 text-muted">沒有符合條件的商品。</div> : null}
            <div className="hidden border-b border-cyan/15 px-3 pb-2 text-xs uppercase tracking-[0.16em] text-muted md:grid md:grid-cols-[1.1fr_0.9fr_0.9fr_1fr_1fr_0.9fr_0.8fr]">
              <span>商品</span>
              <span>價格</span>
              <span>漲跌</span>
              <span>高低</span>
              <span>量 / 時間</span>
              <span>來源</span>
              <span className="text-right">狀態</span>
            </div>
            {filteredItems.map((item) => (
              <MarketRow key={`${item.market}:${item.symbol}`} item={item} />
            ))}
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}

function MarketRow({ item }: { item: MarketData }) {
  const isUp = item.changePercent > 0;
  const isDown = item.changePercent < 0;
  const priceColor = isUp ? "text-red-300" : isDown ? "text-green-300" : "text-cyan";
  const sign = item.changePercent > 0 ? "+" : "";

  return (
    <Link
      href={`/market/${item.market}/${encodeURIComponent(item.symbol)}`}
      className="grid gap-2 border-b border-cyan/10 px-3 py-3 text-sm transition last:border-b-0 hover:bg-cyan/5 md:grid-cols-[1.1fr_0.9fr_0.9fr_1fr_1fr_0.9fr_0.8fr] md:items-center"
    >
      <div>
        <div className="font-orbitron text-base font-bold text-white">{item.symbol}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-muted">{item.displayName} / {item.market}</div>
      </div>
      <div className={`font-mono text-base ${priceColor}`}>{item.price.toLocaleString()}</div>
      <div className={priceColor}>
        {sign}{item.change.toFixed(2)}
        <br />
        {sign}{item.changePercent.toFixed(2)}%
      </div>
      <div className="text-muted">
        H {item.high.toLocaleString()}
        <br />
        L {item.low.toLocaleString()}
      </div>
      <div className="text-muted">
        Vol {item.volume.toLocaleString()}
        <br />
        {item.tradeTime}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={`rounded border px-2 py-1 text-xs ${sourceClass[item.source]}`}>{item.source}</span>
        {item.stale ? <span className="rounded border border-yellow-400/40 px-2 py-1 text-xs text-yellow">STALE</span> : null}
      </div>
      <div className="flex md:justify-end">
        <StatusBadge status={item.status} />
      </div>
    </Link>
  );
}
