"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyJsonButton } from "@/components/copy-json-button";
import { OLEDPreview } from "@/components/oled-preview";
import { PetFace } from "@/components/pet-face";
import { RGBStatus } from "@/components/rgb-status";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";
import { PriceColorModeToggle, usePriceColorMode } from "@/components/price-color-mode-toggle";
import { companionMessage, type CompanionMode } from "@/lib/companion";
import { demoStates } from "@/lib/demo-data";
import { getDirectionRgbColor } from "@/lib/market/color";
import type { MarketStatus } from "@/lib/market-status";

const statuses: MarketStatus[] = ["calm", "up", "up_alert", "down", "down_alert", "error", "closed"];
const companionModes: CompanionMode[] = ["normal", "flirt", "quiet"];
const statusButtonLabels: Record<MarketStatus, string> = {
  calm: "平穩",
  up: "上漲",
  up_alert: "上漲提醒",
  down: "下跌",
  down_alert: "下跌提醒",
  error: "API 異常",
  closed: "休市",
  quiet: "安靜",
};

export default function DemoPage() {
  const [status, setStatus] = useState<MarketStatus>("up_alert");
  const [companionMode, setCompanionMode] = useState<CompanionMode>("normal");
  const { priceColorMode, setPriceColorMode } = usePriceColorMode();
  const data = demoStates[status];
  const deviceId = "ML-ESP32-DEMO";
  const rgbColor = getDirectionRgbColor(status, priceColorMode);

  const json = useMemo(
    () => ({
      deviceId,
      mode: "demo",
      status,
      companionMode,
      oled: {
        line1: data.line1,
        line2: data.line2,
        line3: data.line3,
        line4: data.line4,
      },
      rgb: {
        color: rgbColor,
        pulse: status.includes("alert"),
      },
      pet: {
        status,
        message: companionMessage(status, companionMode),
      },
      fallback: {
        source: status === "error" || status === "closed" ? "DEMO" : "TWSE/OKX",
        stale: status === "error" || status === "closed",
        warning: status === "error" ? "Real provider failed, using demo fallback" : "",
      },
      buzzer: {
        enabled: status.includes("alert") && status !== "quiet",
      },
      api: {
        config: `/api/device/config?deviceId=${deviceId}`,
        market: `/api/device/market?deviceId=${deviceId}`,
      },
      updatedAt: "2026-05-29T07:12:08+08:00",
    }),
    [companionMode, data, rgbColor, status],
  );

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <Link href="/" className="back-link">← 首頁</Link>
            <h1 className="page-title">裝置展示模式</h1>
            <p className="page-copy">競賽展示用：OLED、RGB、小助手、fallback 與 ESP32 API 資料流集中在這裡。</p>
            <p className="mt-2 text-sm text-amber-200">台股畫面為展示資料，重點是呈現 ESP32 同步與提醒流程。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PriceColorModeToggle mode={priceColorMode} onChange={setPriceColorMode} />
            <StatusBadge status={status} colorMode={priceColorMode} />
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr_1fr]">
          <TerminalPanel title="OLED 模擬器" label="128x64">
            <OLEDPreview line1={data.line1} line2={data.line2} line3={data.line3} line4={data.line4} status={status} colorMode={priceColorMode} />
            <div className="mt-4 text-sm leading-7 text-slate-300">{data.note}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(status === "error" || status === "closed") ? (
                <>
                  <span className="badge">DEMO</span>
                  <span className="badge border-amber-400/30 bg-amber-400/10 text-amber-200">STALE</span>
                </>
              ) : (
                <span className="badge border-indigo-400/30 bg-indigo-500/10 text-indigo-200">REAL</span>
              )}
            </div>
          </TerminalPanel>

          <TerminalPanel title="RGB 輸出" label="GPIO">
            <RGBStatus status={status} color={rgbColor} />
            <div className="mt-5">
              <PetFace status={status} name="Miko" size="md" colorMode={priceColorMode} />
            </div>
            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 text-sm leading-6 text-slate-100">
              {companionMessage(status, companionMode)}
            </div>
          </TerminalPanel>

          <TerminalPanel title="控制面板" label="輸入">
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                    className={`btn-secondary justify-center ${
                    status === item
                      ? "border-indigo-400/45 bg-indigo-500/15 text-indigo-100"
                      : ""
                  }`}
                >
                  {statusButtonLabels[item]}
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {companionModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCompanionMode(mode)}
                  className={`btn-secondary justify-center ${
                    companionMode === mode
                      ? "border-violet-400/45 bg-violet-500/15 text-violet-100"
                      : ""
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <CopyJsonButton value={json} />
              <button className="btn-secondary" type="button" onClick={() => setStatus("up_alert")}>重設展示</button>
              <button className="btn-secondary border-amber-400/35 bg-amber-400/10 text-amber-100" type="button" onClick={() => setStatus("error")}>模擬 API 異常</button>
              <button className="btn-secondary" type="button" onClick={() => setStatus("closed")}>模擬 TWSE 休市</button>
              <button className="btn-secondary" type="button" onClick={() => setStatus("quiet")}>模擬安靜模式</button>
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <TerminalPanel title="Fallback 情境" label="SOURCE">
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
                真實資料：顯示 <span className="text-indigo-200">TWSE</span> / <span className="text-violet-200">OKX</span>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
                fallback：顯示 <span className="text-slate-300">DEMO</span> 或 <span className="text-amber-200">CACHE</span>，並標記 <span className="text-amber-200">STALE</span>
              </div>
              <button
                type="button"
                onClick={() => setStatus("error")}
                className="btn-secondary border-amber-400/35 bg-amber-400/10 text-amber-100"
              >
                模擬 fallback warning
              </button>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Device API Demo" label="ESP32">
            <div className="space-y-3 text-sm">
              <div className="break-all rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 font-mono text-indigo-100">
                /api/device/config?deviceId={deviceId}
              </div>
              <div className="break-all rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 font-mono text-indigo-100">
                /api/device/market?deviceId={deviceId}
              </div>
              <div className="text-slate-300">ESP32 firmware 可固定讀取這兩條 URL，資產清單由 /watchlist 儲存到 server-side device config。</div>
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="ESP32 JSON Preview" label="資料包">
            <pre className="code-block">
              {JSON.stringify(json, null, 2)}
            </pre>
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}
