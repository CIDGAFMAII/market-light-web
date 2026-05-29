import Link from "next/link";
import { ColorAwareOLEDPreview, ColorAwareStatusBadge } from "@/components/color-aware-market-preview";
import { CopyJsonButton } from "@/components/copy-json-button";
import { MarketDetailPricePanel } from "@/components/market-detail-price-panel";
import { TerminalPanel } from "@/components/terminal-panel";
import { getMarketCollection } from "@/lib/market/service";
import type { MarketName, MarketTarget } from "@/lib/market/types";

type PageProps = {
  params: Promise<{
    market: string;
    symbol: string;
  }>;
};

export default async function MarketDetailPage({ params }: PageProps) {
  const resolved = await params;
  const market = resolved.market.toUpperCase() as MarketName;
  const symbol = decodeURIComponent(resolved.symbol).toUpperCase();
  const target = normalizeTarget(market, symbol);
  const result = await getMarketCollection({ targets: [target] });
  const item = result.items[0];
  const sign = item.changePercent > 0 ? "+" : "";
  const oledLine1 = `${item.symbol} ${item.displayName}`.slice(0, 20);
  const oledLine2 = `${item.price} ${sign}${item.changePercent.toFixed(2)}%`;
  const oledLine3 = `${item.status} ${item.tradeTime}`.slice(0, 20);
  const oledLine4 = `${item.source}${item.stale ? " STALE" : ""}`;
  const esp32Payload = {
    deviceId: "ML-ESP32-8F2A",
    updatedAt: result.updatedAt,
    sourceMode: result.sourceMode,
    market: item.market,
    symbol: item.symbol,
    displayName: item.displayName,
    price: item.price,
    change: item.change,
    changePercent: item.changePercent,
    high: item.high,
    low: item.low,
    volume: item.volume,
    tradeTime: item.tradeTime,
    tradeDate: item.tradeDate,
    source: item.source,
    quoteQuality: item.quoteQuality,
    stale: item.stale,
    status: item.status,
    oled: {
      line1: oledLine1,
      line2: oledLine2,
      line3: oledLine3,
      line4: oledLine4,
    },
  };

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <Link href="/market" className="back-link">← 市場看盤</Link>
            <h1 className="page-title font-mono">{item.symbol}</h1>
            <p className="page-copy">{item.displayName} / {item.market}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge border-indigo-400/30 bg-indigo-500/10 text-indigo-200">{item.source}</span>
            {item.quoteQuality ? <span className="badge">{item.quoteQuality.toUpperCase()}</span> : null}
            {item.stale ? <span className="badge border-amber-400/30 bg-amber-400/10 text-amber-200">STALE</span> : null}
            <ColorAwareStatusBadge status={item.status} />
          </div>
        </div>

        {result.warnings.length > 0 ? (
          <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
            {result.warnings.join("；")}
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <TerminalPanel title="完整行情" label={result.sourceMode}>
            <div className="grid gap-3 sm:grid-cols-2">
              <MarketDetailPricePanel price={item.price} change={item.change} changePercent={item.changePercent} />
              <DataLine label="symbol" value={item.symbol} />
              <DataLine label="displayName" value={item.displayName} />
              <DataLine label="high" value={item.high.toLocaleString()} />
              <DataLine label="low" value={item.low.toLocaleString()} />
              <DataLine label="volume" value={item.volume.toLocaleString()} />
              <DataLine label="tradeTime" value={item.tradeTime} />
              {item.tradeDate ? <DataLine label="tradeDate" value={item.tradeDate} /> : null}
              <DataLine label="source" value={item.source} />
              <DataLine label="quoteQuality" value={item.quoteQuality ?? "-"} />
              <DataLine label="status" value={item.status} />
              <DataLine label="stale" value={item.stale ? "true" : "false"} />
            </div>
          </TerminalPanel>

          <TerminalPanel title="OLED Preview" label="ESP32">
            <ColorAwareOLEDPreview line1={oledLine1} line2={oledLine2} line3={oledLine3} line4={oledLine4} status={item.status} />
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="API JSON Preview" label="PAYLOAD">
            <div className="mb-3 flex justify-end">
              <CopyJsonButton value={esp32Payload} />
            </div>
            <pre className="code-block">
              {JSON.stringify(esp32Payload, null, 2)}
            </pre>
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 font-mono text-indigo-200">{value}</div>
    </div>
  );
}

function normalizeTarget(market: MarketName, symbol: string): MarketTarget {
  const normalizedMarket = market === "OKX" ? "OKX" : "TWSE";
  return {
    market: normalizedMarket,
    symbol,
    displayName: normalizedMarket === "OKX" ? symbol.split("-")[0] : symbol,
    exchange: normalizedMarket === "TWSE" ? "tse" : undefined,
    enabled: true,
  };
}
