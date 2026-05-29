"use client";

import { useState } from "react";
import { CopyJsonButton } from "./copy-json-button";
import { TerminalPanel } from "./terminal-panel";

export function StocksSettingsClient() {
  const [market, setMarket] = useState<"TWSE" | "OKX">("OKX");
  const [symbol, setSymbol] = useState("BTC-USDT");
  const [exchange, setExchange] = useState("tse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [json, setJson] = useState<unknown>(null);

  const endpoint =
    market === "OKX"
      ? `/api/provider/okx/instruments?instType=SPOT&instId=${encodeURIComponent(symbol)}`
      : `/api/provider/twse?symbol=${encodeURIComponent(symbol)}&exchange=${encodeURIComponent(exchange)}`;

  async function validate() {
    setLoading(true);
    setError("");
    setJson(null);

    try {
      const response = await fetch(endpoint);
      const payload = await response.json();
      setJson(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Validate failed");
    } finally {
      setLoading(false);
    }
  }

  const okxLive =
    market === "OKX" &&
    typeof json === "object" &&
    json !== null &&
    "items" in json &&
    Array.isArray(json.items) &&
    json.items[0]?.state === "live";

  return (
    <TerminalPanel title="資料檢查" label="TOOLS">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          市場
          <select
            value={market}
            onChange={(event) => {
              const next = event.target.value as "TWSE" | "OKX";
              setMarket(next);
              setSymbol(next === "OKX" ? "BTC-USDT" : "2330");
            }}
            className="field"
          >
            <option value="OKX">OKX</option>
            <option value="TWSE">TWSE</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          {market === "OKX" ? "instId" : "股票代號"}
          <input className="field" value={symbol} onChange={(event) => setSymbol(event.target.value)} />
        </label>
        {market === "TWSE" ? (
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            交易所
            <select className="field" value={exchange} onChange={(event) => setExchange(event.target.value)}>
              <option value="tse">tse</option>
              <option value="otc">otc</option>
            </select>
          </label>
        ) : (
          <div className="soft-card p-3 text-sm text-slate-400">
            OKX symbol 使用 instId 格式，例如 BTC-USDT。
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={validate}
          disabled={loading}
          className="btn-primary disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "驗證中" : market === "OKX" ? "Validate OKX Instrument" : "Test TWSE"}
        </button>
        {okxLive ? <span className="badge border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-emerald-200">Valid / Live</span> : null}
      </div>

      <div className="mt-3 break-all rounded-lg border border-slate-700/70 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-300">
        {endpoint}
      </div>
      {error ? <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-red-200">{error}</div> : null}
      {json ? (
        <div className="mt-4">
          <div className="mb-3 flex justify-end">
            <CopyJsonButton value={json} />
          </div>
          <pre className="code-block max-h-96 overflow-auto">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      ) : null}
    </TerminalPanel>
  );
}
