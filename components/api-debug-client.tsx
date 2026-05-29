"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { CopyJsonButton } from "./copy-json-button";
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
  children?: ReactNode;
};

export function ApiDebugClient() {
  const [twseSymbol, setTwseSymbol] = useState("2330");
  const [twseExchange, setTwseExchange] = useState("tse");
  const [instType, setInstType] = useState("SPOT");
  const [instrumentInstId, setInstrumentInstId] = useState("BTC-USDT");
  const [tickerInstId, setTickerInstId] = useState("BTC-USDT");

  return (
    <div className="grid gap-5">
      <TestPanel
        title="TWSE 測試"
        buttonLabel="Fetch TWSE"
        endpoint={`/api/provider/twse?symbol=${encodeURIComponent(twseSymbol)}&exchange=${encodeURIComponent(twseExchange)}`}
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
        title="OKX Ticker 測試"
        buttonLabel="Fetch Ticker"
        endpoint={`/api/provider/okx/ticker?instId=${encodeURIComponent(tickerInstId)}`}
      >
        <label className="grid gap-2 text-sm text-muted">
          instId
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={tickerInstId} onChange={(event) => setTickerInstId(event.target.value)} />
        </label>
      </TestPanel>

      <TestPanel title="Public Market 測試" buttonLabel="Fetch Public Market" endpoint="/api/public/market" />
      <TestPanel title="Device Market 測試" buttonLabel="Fetch Device Market" endpoint="/api/device/market" />
      <TestPanel title="Device Config 測試" buttonLabel="Fetch Device Config" endpoint="/api/device/config" />
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
    </div>
  );
}

function TestPanel({ title, endpoint, buttonLabel, method = "GET", body, children }: TestPanelProps) {
  const [state, setState] = useState<ResultState>(emptyState);

  async function run() {
    setState({ loading: true, error: "", json: null });

    try {
      const response = await fetch(endpoint, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
      });
      const json = await response.json();
      setState({ loading: false, error: "", json });
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
