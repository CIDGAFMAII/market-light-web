"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { statusLabels } from "@/lib/market-status";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";
import { PriceColorModeToggle, usePriceColorMode } from "@/components/price-color-mode-toggle";
import { getDirectionTextClass, type PriceColorMode } from "@/lib/market/color";
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
type MarketViewMode = "default" | "watchlist";
type StoredWatchItem = {
  market?: string;
  symbol?: string;
  enabled?: boolean;
};

const watchlistStorageKey = "market-light-watchlist-v1";
const sourceModeStorageKey = "market-light-market-source-mode-v1";
const refreshStorageKey = "market-light-market-refresh-sec-v1";
const refreshIntervals: RefreshInterval[] = [0, 10, 30, 60];

const sourceClass: Record<MarketSource, string> = {
  TWSE: "border-slate-600/60 bg-slate-800/60 text-slate-300",
  OKX: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  FINMIND: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  CACHE: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  DEMO: "border-slate-600/70 bg-slate-800/75 text-slate-200",
};

const qualityClass = {
  latest: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  partial: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  daily: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  fallback: "border-slate-600/70 bg-slate-800/75 text-slate-200",
};

export function MarketBoardClient() {
  const [items, setItems] = useState<MarketData[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [marketMood, setMarketMood] = useState<MarketStatus>("calm");
  const [sourceMode, setSourceMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [sourceModeSetting, setSourceModeSetting] = useState<SourceModeSetting>("real");
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(30);
  const [marketViewMode, setMarketViewMode] = useState<MarketViewMode>("default");
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDesc, setSortDesc] = useState(true);
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const { priceColorMode, setPriceColorMode } = usePriceColorMode();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentWatchlistSymbols = getEnabledWatchlistSymbols();
      setWatchlistCount(currentWatchlistSymbols.length);
      let endpoint = sourceModeSetting === "demo" ? "/api/public/market?demoMode=true" : "/api/public/market";

      if (marketViewMode === "watchlist") {
        const enabledSymbols = currentWatchlistSymbols;
        setWatchlistSymbols(enabledSymbols);

        if (enabledSymbols.length === 0) {
          setItems([]);
          setWarnings([]);
          setUpdatedAt(new Date().toISOString());
          setMarketMood("calm");
          setSourceMode("MY_WATCHLIST");
          return;
        }

        const params = new URLSearchParams({ symbols: enabledSymbols.join(",") });
        if (sourceModeSetting === "demo") {
          params.set("demoMode", "true");
        }
        endpoint = `/api/device/market?${params.toString()}`;
      } else {
        setWatchlistSymbols([]);
      }

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
  }, [marketViewMode, sourceModeSetting]);

  const refreshWatchlistCount = useCallback(() => {
    setWatchlistCount(getEnabledWatchlistSymbols().length);
  }, []);

  useEffect(() => {
    const savedSourceMode = window.localStorage.getItem(sourceModeStorageKey);
    const savedRefreshRaw = window.localStorage.getItem(refreshStorageKey);
    const savedRefresh = savedRefreshRaw === null ? Number.NaN : Number(savedRefreshRaw);

    if (savedSourceMode === "real" || savedSourceMode === "demo") {
      setSourceModeSetting(savedSourceMode);
    }
    if (savedRefresh === 0 || savedRefresh === 10 || savedRefresh === 30 || savedRefresh === 60) {
      setRefreshInterval(savedRefresh);
    }
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === watchlistStorageKey) {
        refreshWatchlistCount();
      }
    }

    refreshWatchlistCount();
    window.addEventListener("focus", refreshWatchlistCount);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", refreshWatchlistCount);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshWatchlistCount]);

  useEffect(() => {
    window.localStorage.setItem(sourceModeStorageKey, sourceModeSetting);
    void refresh();
  }, [refresh, sourceModeSetting]);

  useEffect(() => {
    if (!settingsLoaded) return undefined;
    window.localStorage.setItem(refreshStorageKey, String(refreshInterval));

    if (refreshInterval === 0) return undefined;
    const timer = window.setInterval(() => {
      void refresh();
    }, refreshInterval * 1000);

    return () => window.clearInterval(timer);
  }, [refresh, refreshInterval, settingsLoaded]);

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

  function updateMarketViewMode(nextMode: MarketViewMode) {
    setMarketViewMode(nextMode);
  }

  function updateRefreshInterval(nextInterval: RefreshInterval) {
    setRefreshInterval(nextInterval);
    window.localStorage.setItem(refreshStorageKey, String(nextInterval));
  }

  function viewTabClass(mode: MarketViewMode) {
    const isActive = marketViewMode === mode;
    return `min-h-11 rounded-lg border px-5 py-2.5 text-sm font-bold transition duration-200 sm:min-w-32 ${
      isActive
        ? "border-indigo-400/55 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white shadow-[0_18px_35px_rgba(99,102,241,0.18)]"
        : "border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
    }`;
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <Link href="/" className="back-link">← 首頁</Link>
            <h1 className="page-title">市場看盤</h1>
            <p className="page-copy">OKX 加密貨幣為真實資料；台股目前以 Demo 資料展示 ESP32 同步與提醒流程。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="segmented-control">
              <span className="segmented-label">View</span>
              <button
                type="button"
                onClick={() => updateMarketViewMode("default")}
                className={viewTabClass("default")}
              >
                預設市場
              </button>
              <button
                type="button"
                onClick={() => updateMarketViewMode("watchlist")}
                className={viewTabClass("watchlist")}
              >
                我的自選{watchlistCount > 0 ? ` ${watchlistCount}` : ""}
              </button>
            </div>
            <PriceColorModeToggle mode={priceColorMode} onChange={setPriceColorMode} />
            <button
              type="button"
              onClick={() => updateSourceMode(sourceModeSetting === "demo" ? "real" : "demo")}
              className={`btn-secondary ${
                sourceModeSetting === "demo"
                  ? "border-amber-400/35 bg-amber-400/10 text-amber-100"
                  : ""
              }`}
            >
              Demo Mode {sourceModeSetting === "demo" ? "On" : "Off"}
            </button>
            <div className="segmented-control">
              <span className="segmented-label">Auto</span>
              {refreshIntervals.map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => updateRefreshInterval(interval)}
                  className={`segmented-option ${refreshInterval === interval ? "segmented-option-active" : ""}`}
                >
                  {interval === 0 ? "Off" : `${interval}s`}
                </button>
              ))}
            </div>
            <Link href="/watchlist" className="btn-secondary">
              自選資產
            </Link>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="btn-primary disabled:cursor-wait"
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
              className="field"
            />
            <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value as MarketFilter)} className="field">
              <option value="ALL">ALL Market</option>
              <option value="TWSE">TWSE</option>
              <option value="OKX">OKX</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="field">
              <option value="ALL">ALL Status</option>
              <option value="up">up</option>
              <option value="down">down</option>
              <option value="up_alert">up_alert</option>
              <option value="down_alert">down_alert</option>
              <option value="calm">calm</option>
            </select>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="field">
              <option value="price">依 price 排序</option>
              <option value="changePercent">依 changePercent 排序</option>
              <option value="volume">依 volume 排序</option>
            </select>
            <button type="button" onClick={() => setSortDesc((value) => !value)} className="btn-secondary">
              {sortDesc ? "由高到低" : "由低到高"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>更新時間：{updatedAt ? new Date(updatedAt).toLocaleString("zh-TW") : "尚未更新"}</span>
            <span>顯示：{filteredItems.length} / {items.length}</span>
            {marketViewMode === "watchlist" ? <span>我的自選：{watchlistSymbols.length}</span> : null}
            <span>Auto refresh: {refreshInterval === 0 ? "Off" : `${refreshInterval}s`}</span>
            <span>狀態摘要：{moodSummary}</span>
            {warnings.length > 0 ? (
              <details className="text-amber-200">
                <summary className="cursor-pointer">資料來源說明</summary>
                <div className="mt-2 max-w-3xl leading-5 text-amber-200/90">{warnings.join("；")}</div>
              </details>
            ) : null}
          </div>
          {error ? <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        </TerminalPanel>

        <section className="mt-5">
          <TerminalPanel title="即時行情" label={loading ? "LOADING" : "LIVE"}>
            {loading && items.length === 0 ? <div className="p-6 text-slate-300">正在讀取真實資料...</div> : null}
            {!loading && marketViewMode === "watchlist" && watchlistSymbols.length === 0 ? (
              <div className="flex flex-col gap-4 p-6 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>尚未新增自選資產。前往 /watchlist 新增。</span>
                <Link href="/watchlist" className="btn-primary w-fit">
                  前往自選資產
                </Link>
              </div>
            ) : null}
            {!loading && filteredItems.length === 0 && !(marketViewMode === "watchlist" && watchlistSymbols.length === 0) ? (
              <div className="p-6 text-slate-300">沒有符合條件的商品。</div>
            ) : null}
            {items.length > 0 ? <div className="hidden border-b border-slate-700/70 px-3 pb-3 text-xs font-semibold text-slate-300 md:grid md:grid-cols-[1.1fr_0.9fr_0.9fr_1fr_1fr_0.9fr_0.8fr]">
              <span>商品</span>
              <span>價格</span>
              <span>漲跌</span>
              <span>高低</span>
              <span>量 / 時間</span>
              <span>來源</span>
              <span className="text-right">狀態</span>
            </div> : null}
            {filteredItems.map((item) => (
              <MarketRow key={`${item.market}:${item.symbol}`} item={item} priceColorMode={priceColorMode} />
            ))}
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}

function getEnabledWatchlistSymbols() {
  try {
    const raw = window.localStorage.getItem(watchlistStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const symbols: string[] = [];

    for (const item of parsed as StoredWatchItem[]) {
      const market = item.market === "OKX" || item.market === "TWSE" ? item.market : null;
      const symbol = typeof item.symbol === "string" ? item.symbol.trim().toUpperCase() : "";

      if (!market || !symbol || item.enabled !== true) continue;
      if (market === "TWSE" && !/^\d+$/.test(symbol)) continue;
      if (market === "OKX" && !/^[A-Z0-9]+-[A-Z0-9]+$/.test(symbol)) continue;

      const token = `${market}:${symbol}`;
      if (seen.has(token)) continue;
      seen.add(token);
      symbols.push(token);
    }

    return symbols;
  } catch {
    return [];
  }
}

function MarketRow({ item, priceColorMode }: { item: MarketData; priceColorMode: PriceColorMode }) {
  const priceColor = getDirectionTextClass(item.changePercent, priceColorMode);
  const sign = item.changePercent > 0 ? "+" : "";

  return (
    <Link
      href={`/market/${item.market}/${encodeURIComponent(item.symbol)}`}
      className="grid gap-2 border-b border-slate-700/60 px-3 py-3 text-sm transition duration-200 last:border-b-0 hover:bg-slate-900/85 md:grid-cols-[1.1fr_0.9fr_0.9fr_1fr_1fr_0.9fr_0.8fr] md:items-center"
    >
      <div>
        <div className="font-mono text-base font-bold text-slate-50">{item.symbol}</div>
        <div className="text-xs font-medium text-slate-300">{item.displayName} / {item.market}</div>
      </div>
      <div className={`font-mono text-base ${priceColor}`}>{item.price.toLocaleString()}</div>
      <div className={priceColor}>
        {sign}{item.change.toFixed(2)}
        <br />
        {sign}{item.changePercent.toFixed(2)}%
      </div>
      <div className="text-slate-400">
        H {item.high.toLocaleString()}
        <br />
        L {item.low.toLocaleString()}
      </div>
      <div className="text-slate-400">
        Vol {item.volume.toLocaleString()}
        <br />
        {item.tradeDate ? `${item.tradeDate} ` : ""}{item.tradeTime}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={`badge ${sourceClass[item.source]}`}>{item.source}</span>
        {item.quoteQuality ? <span className={`badge ${qualityClass[item.quoteQuality]}`}>{qualityLabel(item)}</span> : null}
        {item.stale ? <span className="badge border-amber-400/30 bg-amber-400/10 text-amber-200">STALE</span> : null}
      </div>
      <div className="flex md:justify-end">
        <StatusBadge status={item.status} colorMode={priceColorMode} />
      </div>
    </Link>
  );
}

function qualityLabel(item: MarketData) {
  if (item.source === "TWSE" && item.quoteQuality === "latest") return "即時";
  if (item.source === "TWSE" && item.quoteQuality === "partial") return "TWSE 部分盤中資料";
  if (item.source === "FINMIND" && item.quoteQuality === "daily") return "FinMind 日資料";
  if (item.source === "CACHE") return "快取";
  if (item.source === "DEMO" && item.market === "TWSE") return "台股 Demo";
  if (item.source === "DEMO") return "展示資料";
  return item.quoteQuality?.toUpperCase() ?? "";
}
