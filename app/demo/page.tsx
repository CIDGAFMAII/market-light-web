"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyJsonButton } from "@/components/copy-json-button";
import { OLEDPreview } from "@/components/oled-preview";
import { PetFace } from "@/components/pet-face";
import { RGBStatus } from "@/components/rgb-status";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";
import { companionMessage, type CompanionMode } from "@/lib/companion";
import { demoStates } from "@/lib/demo-data";
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
  const data = demoStates[status];
  const deviceId = "ML-ESP32-DEMO";

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
        color: data.rgb,
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
    [companionMode, data, status],
  );

  return (
    <main className="min-h-screen terminal-grid px-5 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" className="text-sm uppercase tracking-[0.18em] text-cyan">← 首頁</Link>
            <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">裝置展示模式</h1>
            <p className="mt-3 text-muted">競賽展示用：OLED、RGB、小助手、fallback 與 ESP32 API 資料流集中在這裡。</p>
            <p className="mt-2 text-sm text-yellow">台股畫面為展示資料，重點是呈現 ESP32 同步與提醒流程。</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr_1fr]">
          <TerminalPanel title="OLED 模擬器" label="128x64">
            <OLEDPreview line1={data.line1} line2={data.line2} line3={data.line3} line4={data.line4} status={status} />
            <div className="mt-4 text-sm leading-7 text-muted">{data.note}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(status === "error" || status === "closed") ? (
                <>
                  <span className="rounded border border-gray-500/40 px-2 py-1 text-xs text-muted">DEMO</span>
                  <span className="rounded border border-yellow-400/40 px-2 py-1 text-xs text-yellow">STALE</span>
                </>
              ) : (
                <span className="rounded border border-cyan/40 px-2 py-1 text-xs text-cyan">REAL</span>
              )}
            </div>
          </TerminalPanel>

          <TerminalPanel title="RGB 輸出" label="GPIO">
            <RGBStatus status={status} color={data.rgb} />
            <div className="mt-5">
              <PetFace status={status} name="Miko" size="md" />
            </div>
            <div className="mt-4 rounded border border-white/10 bg-black/30 p-3 text-sm leading-6 text-white">
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
                  className={`rounded border px-3 py-2 text-sm uppercase tracking-[0.14em] transition ${
                    status === item
                      ? "border-[var(--border-cyan)] bg-cyan/15 text-cyan"
                      : "border-white/10 bg-black/25 text-muted hover:border-[var(--border-pink)] hover:text-pink"
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
                  className={`rounded border px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
                    companionMode === mode
                      ? "border-[var(--border-pink)] bg-pink/10 text-pink"
                      : "border-white/10 bg-black/25 text-muted hover:border-pink/40 hover:text-pink"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <CopyJsonButton value={json} />
              <button className="rounded border border-white/10 px-3 py-2 text-sm uppercase tracking-[0.16em] text-muted hover:border-cyan/40 hover:text-cyan" type="button" onClick={() => setStatus("up_alert")}>重設展示</button>
              <button className="rounded border border-yellow-400/35 px-3 py-2 text-sm uppercase tracking-[0.16em] text-yellow hover:bg-yellow/10" type="button" onClick={() => setStatus("error")}>模擬 API 異常</button>
              <button className="rounded border border-white/10 px-3 py-2 text-sm uppercase tracking-[0.16em] text-muted hover:border-cyan/40 hover:text-cyan" type="button" onClick={() => setStatus("closed")}>模擬 TWSE 休市</button>
              <button className="rounded border border-white/10 px-3 py-2 text-sm uppercase tracking-[0.16em] text-muted hover:border-cyan/40 hover:text-cyan" type="button" onClick={() => setStatus("quiet")}>模擬安靜模式</button>
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <TerminalPanel title="Fallback 情境" label="SOURCE">
            <div className="space-y-3 text-sm leading-6 text-muted">
              <div className="rounded border border-white/10 bg-black/30 p-3">
                真實資料：顯示 <span className="text-cyan">TWSE</span> / <span className="text-pink">OKX</span>
              </div>
              <div className="rounded border border-white/10 bg-black/30 p-3">
                fallback：顯示 <span className="text-muted">DEMO</span> 或 <span className="text-yellow">CACHE</span>，並標記 <span className="text-yellow">STALE</span>
              </div>
              <button
                type="button"
                onClick={() => setStatus("error")}
                className="rounded border border-yellow-400/35 px-3 py-2 text-sm uppercase tracking-[0.16em] text-yellow hover:bg-yellow/10"
              >
                模擬 fallback warning
              </button>
            </div>
          </TerminalPanel>

          <TerminalPanel title="Device API Demo" label="ESP32">
            <div className="space-y-3 text-sm">
              <div className="break-all rounded border border-white/10 bg-black/35 p-3 text-cyan">
                /api/device/config?deviceId={deviceId}
              </div>
              <div className="break-all rounded border border-white/10 bg-black/35 p-3 text-cyan">
                /api/device/market?deviceId={deviceId}
              </div>
              <div className="text-muted">ESP32 firmware 可固定讀取這兩條 URL，資產清單由 /watchlist 儲存到 server-side device config。</div>
            </div>
          </TerminalPanel>
        </section>

        <section className="mt-5">
          <TerminalPanel title="ESP32 JSON Preview" label="資料包">
            <pre className="overflow-x-auto rounded border border-cyan/10 bg-black/45 p-4 text-sm leading-6 text-green-300">
              {JSON.stringify(json, null, 2)}
            </pre>
          </TerminalPanel>
        </section>
      </div>
    </main>
  );
}
