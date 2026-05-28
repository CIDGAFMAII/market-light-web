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
    <TerminalPanel title="股票設定測試" label="MOCK">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-muted">
          市場
          <select
            value={market}
            onChange={(event) => {
              const next = event.target.value as "TWSE" | "OKX";
              setMarket(next);
              setSymbol(next === "OKX" ? "BTC-USDT" : "2330");
            }}
            className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan"
          >
            <option value="OKX">OKX</option>
            <option value="TWSE">TWSE</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted">
          {market === "OKX" ? "instId" : "股票代號"}
          <input className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={symbol} onChange={(event) => setSymbol(event.target.value)} />
        </label>
        {market === "TWSE" ? (
          <label className="grid gap-2 text-sm text-muted">
            交易所
            <select className="rounded border border-cyan/20 bg-black/40 px-3 py-2 text-cyan" value={exchange} onChange={(event) => setExchange(event.target.value)}>
              <option value="tse">tse</option>
              <option value="otc">otc</option>
            </select>
          </label>
        ) : (
          <div className="rounded border border-cyan/10 bg-black/25 p-3 text-sm text-muted">
            OKX symbol 使用 instId 格式，例如 BTC-USDT。
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={validate}
          disabled={loading}
          className="rounded border border-[var(--border-cyan)] px-4 py-2 text-sm uppercase tracking-[0.16em] text-cyan transition hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "驗證中" : market === "OKX" ? "Validate OKX Instrument" : "Test TWSE"}
        </button>
        {okxLive ? <span className="rounded border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">Valid / Live</span> : null}
      </div>

      <div className="mt-3 break-all rounded border border-white/10 bg-black/35 px-3 py-2 text-xs text-muted">
        {endpoint}
      </div>
      {error ? <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</div> : null}
      {json ? (
        <div className="mt-4">
          <div className="mb-3 flex justify-end">
            <CopyJsonButton value={json} />
          </div>
          <pre className="max-h-96 overflow-auto rounded border border-cyan/10 bg-black/45 p-4 text-sm leading-6 text-green-300">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      ) : null}
    </TerminalPanel>
  );
}
