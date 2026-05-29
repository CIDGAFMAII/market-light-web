"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  formatPreviewLines,
  useDashboardPreview,
  type PreviewMarketItem,
} from "./dashboard-preview-context";
import { CopyJsonButton } from "./copy-json-button";
import { OLEDPreview } from "./oled-preview";
import { StatusBadge } from "./status-badge";
import { TerminalPanel } from "./terminal-panel";

type ResultState = {
  loading: boolean;
  error: string;
  json: unknown;
};

const emptyState: ResultState = {
  loading: false,
  error: "",
  json: null,
};

type TestPanelProps = {
  title: string;
  endpoint: string;
  buttonLabel: string;
  method?: "GET" | "POST";
  body?: unknown;
  previewEnabled?: boolean;
  children?: ReactNode;
};

type ApiResponseObject = Record<string, unknown>;

export function ApiDebugClient() {
  const [twseSymbol, setTwseSymbol] = useState("2330");
  const [twseExchange, setTwseExchange] = useState("tse");
  const [finMindSymbol, setFinMindSymbol] = useState("2330");
  const [instType, setInstType] = useState("SPOT");
  const [instrumentInstId, setInstrumentInstId] = useState("BTC-USDT");
  const [tickerInstId, setTickerInstId] = useState("BTC-USDT");

  const { selectedPreviewItem, previewWarnings } = useDashboardPreview();
  const preview = formatPreviewLines(selectedPreviewItem);

  return (
    <div className="grid gap-5">
      <TestPanel
        title="OKX Ticker 測試"
        buttonLabel="TEST OKX"
        endpoint={`/api/provider/okx/ticker?instId=${encodeURIComponent(tickerInstId)}`}
        previewEnabled
      >
        <label className="grid gap-2 text-sm text-muted">
          instId
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={tickerInstId} onChange={(event) => setTickerInstId(event.target.value)} />
        </label>
      </TestPanel>

      <TestPanel
        title="OKX Instruments 測試"
        buttonLabel="Fetch Instruments"
        endpoint={`/api/provider/okx/instruments?instType=${encodeURIComponent(instType)}${instrumentInstId ? `&instId=${encodeURIComponent(instrumentInstId)}` : ""}`}
      >
        <label className="grid gap-2 text-sm text-muted">
          instType
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={instType} onChange={(event) => setInstType(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          instId 選填
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={instrumentInstId} onChange={(event) => setInstrumentInstId(event.target.value)} />
        </label>
      </TestPanel>

      <TestPanel
        title="TWSE Legacy / Demo 測試"
        buttonLabel="TEST TWSE LEGACY"
        endpoint={`/api/provider/twse?symbol=${encodeURIComponent(twseSymbol)}&exchange=${encodeURIComponent(twseExchange)}`}
        previewEnabled
      >
        <label className="grid gap-2 text-sm text-muted">
          股票代號
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={twseSymbol} onChange={(event) => setTwseSymbol(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          交易所
          <select className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={twseExchange} onChange={(event) => setTwseExchange(event.target.value)}>
            <option value="tse">tse</option>
            <option value="otc">otc</option>
          </select>
        </label>
        <div className="rounded border border-yellow-400/30 bg-yellow/10 p-3 text-xs leading-5 text-yellow md:col-span-2">
          Legacy / Experimental：競賽主流程不依賴台股即時資料。台股目前以 Demo 展示資料呈現同步與提醒流程。
        </div>
      </TestPanel>

      <TestPanel
        title="FinMind Legacy / Demo 測試"
        buttonLabel="Test FinMind Daily"
        endpoint={`/api/provider/finmind/daily?symbol=${encodeURIComponent(finMindSymbol)}&debug=true`}
        previewEnabled
      >
        <label className="grid gap-2 text-sm text-muted">
          股票代號
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={finMindSymbol} onChange={(event) => setFinMindSymbol(event.target.value)} />
        </label>
        <div className="rounded border border-blue-400/30 bg-blue-400/10 p-3 text-xs leading-5 text-blue-200">
          Legacy / Experimental：FinMind daily 不是逐筆即時價格；本版台股正式展示採 Demo 資料。
        </div>
      </TestPanel>

      <TestPanel title="Public Market 測試" buttonLabel="Fetch Market API" endpoint="/api/public/market" previewEnabled />
      <TestPanel title="Device Market 測試" buttonLabel="Fetch Device Market" endpoint="/api/device/market" previewEnabled />
      <TestPanel title="Device Config 測試" buttonLabel="Fetch Device Config" endpoint="/api/device/config?deviceId=ML-ESP32-DEMO" />
      <TestPanel
        title="Device Config 更新測試"
        buttonLabel="POST Device Config"
        endpoint="/api/device/config"
        method="POST"
        body={{
          deviceId: "ML-ESP32-DEMO",
          settings: {
            demoMode: false,
            quietMode: false,
            companionMode: "flirt",
            refreshIntervalSec: 30,
            brightness: 80,
            buzzerEnabled: false,
          },
        }}
      />
      <TestPanel
        title="Device Sync Symbols 測試"
        buttonLabel="POST Sync Symbols"
        endpoint="/api/device/sync-symbols"
        method="POST"
        body={{ deviceId: "ML-ESP32-DEMO", syncSymbols: ["TWSE:0050", "TWSE:2330", "OKX:BTC-USDT"] }}
      />
      <TestPanel
        title="Device Market by Device ID 測試"
        buttonLabel="Fetch Device ID Market"
        endpoint="/api/device/market?deviceId=ML-ESP32-DEMO"
        previewEnabled
      />
      <TestPanel
        title="Device Heartbeat 測試"
        buttonLabel="POST Heartbeat"
        endpoint="/api/device/heartbeat"
        method="POST"
        body={{ deviceId: "ML-ESP32-8F2A", battery: 92, rssi: -48 }}
      />
      <TestPanel
        title="Device Event 測試"
        buttonLabel="POST Event"
        endpoint="/api/device/event"
        method="POST"
        body={{ deviceId: "ML-ESP32-8F2A", type: "button_press", value: "next" }}
      />

      <TerminalPanel title="OLED Preview" label="SELECTED">
        <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:items-center">
          <OLEDPreview
            line1={preview.line1}
            line2={preview.line2}
            line3={preview.line3}
            line4={preview.line4}
            status={preview.status}
          />
          <div>
            {selectedPreviewItem ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedPreviewItem.status} />
                  <span className="rounded border border-cyan/35 px-2 py-1 text-xs uppercase tracking-[0.16em] text-cyan">
                    {selectedPreviewItem.source}
                  </span>
                  {selectedPreviewItem.source === "DEMO" ? (
                    <span className="rounded border border-gray-500/40 px-2 py-1 text-xs uppercase tracking-[0.16em] text-muted">DEMO</span>
                  ) : null}
                  {selectedPreviewItem.stale ? (
                    <span className="rounded border border-yellow-400/40 px-2 py-1 text-xs uppercase tracking-[0.16em] text-yellow">STALE</span>
                  ) : null}
                </div>
                <div className="rounded border border-white/10 bg-black/35 p-4 text-sm leading-6 text-muted">
                  <div className="font-orbitron text-lg text-white">{selectedPreviewItem.symbol} {selectedPreviewItem.displayName}</div>
                  <div>price：{selectedPreviewItem.price.toLocaleString()}</div>
                  <div>changePercent：{selectedPreviewItem.changePercent.toFixed(2)}%</div>
                  <div>tradeTime：{selectedPreviewItem.tradeTime}</div>
                </div>
              </>
            ) : (
              <div className="rounded border border-white/10 bg-black/35 p-4 text-muted">尚無可預覽資料</div>
            )}
            {previewWarnings.length > 0 ? (
              <div className="mt-3 rounded border border-yellow-400/35 bg-yellow/10 p-3 text-sm text-yellow">
                {previewWarnings.join("；")}
              </div>
            ) : null}
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}

function TestPanel({ title, endpoint, buttonLabel, method = "GET", body, previewEnabled = false, children }: TestPanelProps) {
  const [state, setState] = useState<ResultState>(emptyState);
  const { setSelectedPreviewItem } = useDashboardPreview();

  async function run() {
    setState({ loading: true, error: "", json: null });

    try {
      const response = await fetch(endpoint, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
      });
      const json = await response.json();
      const responseError =
        isObject(json) && json.success === false
          ? stringValue(json.message) || stringValue(json.providerMessage) || "API returned success=false"
          : "";
      setState({ loading: false, error: responseError, json });

      if (previewEnabled && !responseError) {
        const nextPreview = extractPreviewItem(json);
        if (nextPreview) {
          setSelectedPreviewItem(nextPreview.item, nextPreview.warnings);
        }
      }
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Request failed",
        json: null,
      });
    }
  }

  return (
    <TerminalPanel title={title} label="TEST">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 md:grid-cols-2">{children}</div>
        <button
          type="button"
          onClick={run}
          disabled={state.loading}
          className="rounded border border-[var(--border-cyan)] px-4 py-2 text-sm uppercase tracking-[0.16em] text-cyan transition hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-60"
        >
          {state.loading ? "讀取中" : buttonLabel}
        </button>
      </div>
      <div className="mt-3 break-all rounded border border-white/10 bg-black/35 px-3 py-2 text-xs text-muted">
        {method} {endpoint}
      </div>
      {method === "POST" ? (
        <pre className="mt-3 max-h-40 overflow-auto rounded border border-white/10 bg-black/35 p-3 text-xs leading-5 text-muted">
          {JSON.stringify(body ?? {}, null, 2)}
        </pre>
      ) : null}
      {state.error ? <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{state.error}</div> : null}
      {state.json ? (
        <div className="mt-4">
          <div className="mb-3 flex justify-end">
            <CopyJsonButton value={state.json} />
          </div>
          <pre className="max-h-96 overflow-auto rounded border border-cyan/10 bg-black/45 p-4 text-sm leading-6 text-green-300">
            {JSON.stringify(state.json, null, 2)}
          </pre>
        </div>
      ) : null}
    </TerminalPanel>
  );
}

function extractPreviewItem(json: unknown): { item: PreviewMarketItem; warnings: string[] } | null {
  if (!isObject(json) || json.success !== true) return null;

  const warnings = extractWarnings(json);
  const directItem = toPreviewItem(json);
  if (directItem) return { item: directItem, warnings };

  const items = json.items;
  if (Array.isArray(items)) {
    const firstItem = items.map(toPreviewItem).find((item): item is PreviewMarketItem => Boolean(item));
    if (firstItem) return { item: firstItem, warnings };
  }

  return null;
}

function toPreviewItem(value: unknown): PreviewMarketItem | null {
  if (!isObject(value)) return null;

  const symbol = stringValue(value.symbol);
  const displayName = stringValue(value.displayName);
  const price = numberValue(value.price);
  const changePercent = numberValue(value.changePercent);
  const status = stringValue(value.status);
  const tradeTime = stringValue(value.tradeTime);
  const source = stringValue(value.source);

  if (
    !symbol ||
    !displayName ||
    price === null ||
    changePercent === null ||
    !isPreviewStatus(status) ||
    !tradeTime ||
    !isPreviewSource(source)
  ) {
    return null;
  }

  return {
    symbol,
    displayName,
    price,
    changePercent,
    status,
    tradeTime,
    source,
    stale: value.stale === true,
  };
}

function extractWarnings(value: ApiResponseObject) {
  const warnings: string[] = [];

  if (typeof value.warning === "string") warnings.push(value.warning);
  if (typeof value.providerMessage === "string") warnings.push(value.providerMessage);
  if (Array.isArray(value.warnings)) {
    warnings.push(...value.warnings.filter((item): item is string => typeof item === "string"));
  }

  return warnings;
}

function isObject(value: unknown): value is ApiResponseObject {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isPreviewStatus(value: string): value is PreviewMarketItem["status"] {
  return ["calm", "up", "up_alert", "down", "down_alert", "error", "closed", "quiet"].includes(value);
}

function isPreviewSource(value: string): value is PreviewMarketItem["source"] {
  return ["TWSE", "OKX", "FINMIND", "DEMO", "CACHE"].includes(value);
}
