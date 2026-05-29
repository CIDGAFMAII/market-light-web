"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CopyJsonButton } from "@/components/copy-json-button";
import { OLEDPreview } from "@/components/oled-preview";
import { PetFace } from "@/components/pet-face";
import { RGBStatus } from "@/components/rgb-status";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";
import { PriceColorModeToggle, usePriceColorMode } from "@/components/price-color-mode-toggle";
import { marketItems } from "@/lib/demo-data";
import { getDirectionRgbColor } from "@/lib/market/color";
import { buildSparkline } from "@/lib/market/sparkline";
import { getMarketStatus, petFaces, statusLabels, type MarketStatus } from "@/lib/market-status";
import type { DetailChartRange } from "@/lib/market/providers/okx-candles";

type ScreenMode = "MARKET" | "DETAIL" | "FLIRT";
type DemoMarketSource = "LIVE" | "DEMO_GOOD" | "DEMO_BAD" | "DEMO_CRAZY_UP" | "DEMO_CRAZY_DOWN" | "DEMO_ERROR";
type FlirtTone = "GOOD" | "BAD" | "CRAZY_UP" | "CRAZY_DOWN" | "ERROR";

const sourceCycle: DemoMarketSource[] = ["LIVE", "DEMO_GOOD", "DEMO_BAD", "DEMO_CRAZY_UP", "DEMO_CRAZY_DOWN", "DEMO_ERROR"];
const detailChartRanges: DetailChartRange[] = ["5m", "15m", "1h", "24h"];

const sourceLabels: Record<DemoMarketSource, string> = {
  LIVE: "LIVE",
  DEMO_GOOD: "GOOD",
  DEMO_BAD: "BAD",
  DEMO_CRAZY_UP: "CRAZY+",
  DEMO_CRAZY_DOWN: "CRAZY-",
  DEMO_ERROR: "ERROR",
};

const fixedDemoChange: Record<Exclude<DemoMarketSource, "LIVE">, number> = {
  DEMO_GOOD: 3.2,
  DEMO_BAD: -4.8,
  DEMO_CRAZY_UP: 8.5,
  DEMO_CRAZY_DOWN: -8.5,
  DEMO_ERROR: 0,
};

const flirtPhrasePools: Record<FlirtTone, [string, string][]> = {
  GOOD: [
    ["漲勢微甜", "你最順眼"],
    ["綠光閃閃", "心動滿滿"],
    ["價格上揚", "你也發光"],
    ["趨勢轉強", "別太緊張"],
    ["多頭靠岸", "你別走散"],
    ["走勢很甜", "想你整天"],
    ["線往上偏", "心往你邊"],
    ["漲得剛好", "想你不少"],
  ],
  BAD: [
    ["跌勢很酸", "我陪你扛"],
    ["紅燈亮起", "先別生氣"],
    ["價格回落", "抱緊承諾"],
    ["走勢偏涼", "我在身旁"],
    ["跌得心慌", "你別硬扛"],
    ["市場很冷", "我還很等"],
    ["K線下探", "別太難看"],
    ["它跌它的", "你甜你的"],
  ],
  CRAZY_UP: [
    ["暴漲太猛", "別急著衝"],
    ["K線飛高", "心跳剛好"],
    ["漲得發燙", "你別慌張"],
    ["火箭升空", "別追太兇"],
    ["多頭狂奔", "先穩心神"],
  ],
  CRAZY_DOWN: [
    ["暴跌太兇", "我陪你撐"],
    ["K線墜落", "先別難過"],
    ["跌得很重", "別亂衝動"],
    ["空方太猛", "你先別冷"],
    ["盤面下沉", "我還很真"],
  ],
  ERROR: [
    ["不是不回", "是線太灰"],
    ["訊號走丟", "我還停留"],
    ["API斷", "心沒亂"],
    ["網路迷航", "我還在旁"],
    ["資料沒來", "我先告白"],
    ["連線失蹤", "想你成功"],
    ["伺服器累", "我還會陪"],
    ["不是閃退", "是想你累"],
  ],
};

export default function DemoPage() {
  const [screenMode, setScreenMode] = useState<ScreenMode>("MARKET");
  const [marketSource, setMarketSource] = useState<DemoMarketSource>("LIVE");
  const [quietMode, setQuietMode] = useState(false);
  const [symbolIndex, setSymbolIndex] = useState(0);
  const [detailChartRange, setDetailChartRange] = useState<DetailChartRange>("15m");
  const [flirtNonce, setFlirtNonce] = useState(0);
  const [lastDetailActionAt, setLastDetailActionAt] = useState(Date.now());
  const { priceColorMode, setPriceColorMode } = usePriceColorMode();

  const item = marketItems[symbolIndex % marketItems.length];
  const quote = useMemo(() => buildQuote(item, marketSource, symbolIndex), [item, marketSource, symbolIndex]);
  const sourceTag = `[${sourceLabels[marketSource]}${quietMode ? " q" : ""}]`;
  const chartPoints = useMemo(
    () => buildDemoChartPoints({ range: detailChartRange, symbol: quote.symbol, changePercent: quote.changePercent }),
    [detailChartRange, quote.changePercent, quote.symbol],
  );
  const sparkline = useMemo(() => buildSparkline(chartPoints), [chartPoints]);
  const flirtTone = getFlirtTone(quote.status, quote.changePercent, marketSource);
  const activeFlirtLines = useMemo(
    () => pickFlirtLines(flirtTone, quote.symbol, flirtNonce),
    [flirtNonce, flirtTone, quote.symbol],
  );
  const rgbColor = getDirectionRgbColor(quote.status, priceColorMode);

  const oledLines = useMemo(
    () => buildOledLines({ screenMode, sourceTag, quote, flirtLines: activeFlirtLines, sparkline }),
    [activeFlirtLines, quote, screenMode, sourceTag, sparkline],
  );

  const json = useMemo(
    () => ({
      deviceId: "ML-ESP32-DEMO",
      screenMode,
      marketSource,
      quietMode,
      currentSymbol: quote.symbol,
      buttons: {
        A: "short=next, double=quiet, long=detail",
        B: "cycle market source",
        C: "market/flirt, detail returns market",
      },
      oled: {
        line1: oledLines.line1,
        line2: oledLines.line2,
        line3: oledLines.line3,
        line4: oledLines.line4,
      },
      quote: {
        symbol: quote.symbol,
        displayName: quote.displayName,
        price: quote.price,
        changePercent: quote.changePercent,
        sourceLabel: sourceLabels[marketSource],
        status: quote.status,
      },
      detailChart: {
        range: detailChartRange,
        points: chartPoints,
        sparkline,
        api: `/api/device/chart?symbol=${quote.symbol.includes("-") ? "OKX" : "TWSE"}:${quote.symbol}&range=${detailChartRange}`,
      },
      quietOutput: {
        buzzer: quietMode ? "reduced/off" : "normal",
        rgbBrightness: quietMode ? "dim" : "normal",
        oled: "unchanged",
      },
    }),
    [chartPoints, detailChartRange, marketSource, oledLines, quietMode, quote, screenMode, sparkline],
  );

  useEffect(() => {
    if (screenMode !== "DETAIL") return undefined;

    const timer = window.setTimeout(() => {
      setScreenMode("MARKET");
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, [lastDetailActionAt, screenMode]);

  function touchDetailTimer() {
    setLastDetailActionAt(Date.now());
  }

  function pressAShort() {
    setSymbolIndex((current) => current + 1);
    if (screenMode === "FLIRT") setFlirtNonce((current) => current + 1);
    if (screenMode === "DETAIL") touchDetailTimer();
  }

  function pressADouble() {
    setQuietMode((current) => !current);
    if (screenMode === "DETAIL") touchDetailTimer();
  }

  function pressALong() {
    setScreenMode("DETAIL");
    touchDetailTimer();
  }

  function pressBShort() {
    setMarketSource((current) => sourceCycle[(sourceCycle.indexOf(current) + 1) % sourceCycle.length]);
    if (screenMode === "FLIRT") setFlirtNonce((current) => current + 1);
    if (screenMode === "DETAIL") touchDetailTimer();
  }

  function pressCShort() {
    if (screenMode === "MARKET") {
      setScreenMode("FLIRT");
      setFlirtNonce((current) => current + 1);
      return;
    }

    setScreenMode("MARKET");
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <Link href="/" className="back-link">← 首頁</Link>
            <h1 className="page-title">ESP32 三鍵展示</h1>
            <p className="page-copy">網站模擬最新三鍵互動與 OLED 顯示邏輯；ESP32 firmware 尚未實作。</p>
            <p className="mt-2 text-sm text-amber-200">台股畫面為展示資料，重點是呈現三鍵狀態、同步資產與提醒流程。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PriceColorModeToggle mode={priceColorMode} onChange={setPriceColorMode} />
            <StatusBadge status={quote.status} colorMode={priceColorMode} />
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr_1fr]">
          <TerminalPanel title="OLED Preview" label={sourceTag}>
            <OLEDPreview
              line1={oledLines.line1}
              line2={oledLines.line2}
              line3={oledLines.line3}
              line4={oledLines.line4}
              status={quote.status}
              colorMode={priceColorMode}
            />
            <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <StatePill label="畫面" value={screenMode} />
              <StatePill label="來源" value={sourceLabels[marketSource]} />
              <StatePill label="Quiet" value={quietMode ? "ON" : "OFF"} />
            </div>
          </TerminalPanel>

          <TerminalPanel title="輸出狀態" label="OLED/RGB">
            <RGBStatus status={quote.status} color={quietMode ? "muted" : rgbColor} />
            <div className="mt-5">
              <PetFace status={quote.status} name={screenMode} size="md" colorMode={priceColorMode} />
            </div>
            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 text-sm leading-6 text-slate-100">
              Quiet Mode 只降低提醒強度；OLED 顯示與按鍵功能維持不變。
            </div>
          </TerminalPanel>

          <TerminalPanel title="三鍵模擬" label="INPUT">
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-primary justify-center" type="button" onClick={pressAShort}>A Short</button>
              <button className="btn-secondary justify-center" type="button" onClick={pressADouble}>A Double</button>
              <button className="btn-secondary justify-center" type="button" onClick={pressALong}>A Long</button>
              <button className="btn-secondary justify-center" type="button" onClick={pressBShort}>B Short</button>
              <button className="btn-secondary justify-center sm:col-span-2" type="button" onClick={pressCShort}>C Short</button>
            </div>
            <div className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
              <RuleLine label="A" value="短按下一個，雙擊 Quiet，長按 Detail" />
              <RuleLine label="B" value="只切行情來源，不改畫面模式" />
              <RuleLine label="C" value="Market / Flirt，Detail 中回 Market" />
            </div>
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-slate-300">Detail chart range</div>
              <div className="segmented-control">
                {detailChartRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDetailChartRange(range)}
                    className={`segmented-option ${detailChartRange === range ? "segmented-option-active" : ""}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <TerminalPanel title="行情來源循環" label="SOURCE">
            <div className="grid gap-3 sm:grid-cols-6">
              {sourceCycle.map((source) => (
                <div
                  key={source}
                  className={`rounded-xl border p-3 text-center text-sm font-semibold ${
                    source === marketSource
                      ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-100"
                      : "border-slate-700/70 bg-slate-900/80 text-slate-300"
                  }`}
                >
                  {sourceLabels[source]}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <RuleLine label="GOOD" value="+3.2%" />
              <RuleLine label="BAD" value="-4.8%" />
              <RuleLine label="CRAZY+" value="+8.5%" />
              <RuleLine label="CRAZY-" value="-8.5%" />
              <RuleLine label="ERROR" value="API Lost" />
            </div>
          </TerminalPanel>

          <TerminalPanel title="Flirt Lines" label="2 LINES">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-5 font-mono text-2xl leading-relaxed text-indigo-100">
              <div>{activeFlirtLines[0]}</div>
              <div>{activeFlirtLines[1]}</div>
            </div>
            <div className="mt-4 text-sm leading-6 text-slate-300">
              Flirt 台詞只依行情狀態決定，控制在 0.96 吋 OLED 可讀的兩行短句。
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <TerminalPanel title="DETAIL 行為" label="SPARK">
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-5">
                <div className="font-mono text-sm text-slate-300">{quote.symbol} / {quote.displayName}</div>
                <div className="mt-2 font-mono text-lg text-slate-100">{formatNumber(quote.price)}</div>
                <div className="mt-3 font-mono text-2xl leading-none text-indigo-100">{sparkline}</div>
                <div className="mt-2 text-xs text-slate-400">range {detailChartRange}</div>
              </div>
              <RuleLine label="A Short" value="切下一個標的曲線" />
              <RuleLine label="B Short" value="切行情來源，仍留在 DETAIL" />
              <RuleLine label="C Short" value="直接回 MARKET，不進 FLIRT" />
              <RuleLine label="Idle" value="最後一次操作後 10 秒回 MARKET" />
            </div>
          </TerminalPanel>

          <TerminalPanel title="ESP32 JSON Preview" label="STATE">
            <div className="mb-3 flex justify-end">
              <CopyJsonButton value={json} />
            </div>
            <pre className="code-block max-h-96">
              {JSON.stringify(json, null, 2)}
            </pre>
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}

function buildQuote(item: (typeof marketItems)[number], source: DemoMarketSource, symbolIndex: number) {
  if (source === "DEMO_ERROR") {
    return {
      symbol: item.symbol,
      displayName: item.name,
      price: item.price,
      changePercent: 0,
      high: item.price,
      low: item.price,
      volume: 0,
      status: "error" as MarketStatus,
    };
  }

  if (source === "LIVE") {
    return {
      symbol: item.symbol,
      displayName: item.name,
      price: item.price,
      changePercent: item.changePercent,
      high: item.price + Math.abs(item.change),
      low: item.price - Math.abs(item.change),
      volume: 128000 + symbolIndex * 17000,
      status: item.status,
    };
  }

  const demoChangePercent = fixedDemoChange[source];
  const status = getMarketStatus({ changePercent: demoChangePercent });
  const price = source === "DEMO_CRAZY_UP" || source === "DEMO_CRAZY_DOWN"
    ? item.price * (1 + demoChangePercent / 100)
    : item.price;

  return {
    symbol: item.symbol,
    displayName: item.name,
    price,
    changePercent: demoChangePercent,
    high: price * 1.012,
    low: price * 0.988,
    volume: 200000 + symbolIndex * 21000,
    status,
  };
}

function buildOledLines({
  screenMode,
  sourceTag,
  quote,
  flirtLines: lines,
  sparkline,
}: {
  screenMode: ScreenMode;
  sourceTag: string;
  quote: ReturnType<typeof buildQuote>;
  flirtLines: [string, string];
  sparkline: string;
}) {
  if (screenMode === "FLIRT") {
    return {
      line1: sourceTag,
      line2: lines[0],
      line3: lines[1],
      line4: quote.symbol,
    };
  }

  if (screenMode === "DETAIL") {
    return {
      line1: `${sourceTag} ${quote.symbol}`,
      line2: quote.displayName,
      line3: formatNumber(quote.price),
      line4: sparkline,
    };
  }

  if (quote.status === "error") {
    return {
      line1: `${sourceTag} ${quote.symbol}`,
      line2: "API Lost",
      line3: `${petFaces.error} Wi-Fi`,
      line4: "B switch src",
    };
  }

  const sign = quote.changePercent > 0 ? "+" : "";
  return {
    line1: `${sourceTag} ${quote.symbol}`,
    line2: `${formatNumber(quote.price)} ${sign}${quote.changePercent.toFixed(1)}%`,
    line3: `${petFaces[quote.status]} ${statusLabels[quote.status]}`,
    line4: quote.displayName,
  };
}

function getFlirtTone(status: MarketStatus, changePercent: number, source: DemoMarketSource): FlirtTone {
  if (source === "DEMO_ERROR" || status === "error") return "ERROR";
  if (source === "DEMO_CRAZY_UP") return "CRAZY_UP";
  if (source === "DEMO_CRAZY_DOWN") return "CRAZY_DOWN";
  if (changePercent >= 8) return "CRAZY_UP";
  if (changePercent <= -8) return "CRAZY_DOWN";
  if (changePercent < 0) return "BAD";
  return "GOOD";
}

function pickFlirtLines(tone: FlirtTone, symbol: string, nonce: number): [string, string] {
  const pool = flirtPhrasePools[tone];
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return pool[(seed + nonce) % pool.length];
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  return value.toFixed(2);
}

function buildDemoChartPoints({
  range,
  symbol,
  changePercent,
}: {
  range: DetailChartRange;
  symbol: string;
  changePercent: number;
}) {
  const lengthMap: Record<DetailChartRange, number> = {
    "5m": 5,
    "15m": 15,
    "1h": 12,
    "24h": 24,
  };
  const length = lengthMap[range];
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = 100 + (seed % 30);
  const trend = changePercent / Math.max(length - 1, 1);

  return Array.from({ length }, (_, index) => {
    const wave = Math.sin((index + seed) / 2.1) * 2.5;
    return Number((base + trend * index + wave).toFixed(2));
  });
}

function StatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-slate-100">{value}</div>
    </div>
  );
}

function RuleLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
      <span className="font-semibold text-indigo-200">{label}</span>
      <span className="text-slate-500"> / </span>
      <span>{value}</span>
    </div>
  );
}
