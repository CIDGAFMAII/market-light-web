import Link from "next/link";
import { demoStates } from "@/lib/demo-data";
import { CyberCard } from "@/components/cyber-card";
import { OLEDPreview } from "@/components/oled-preview";
import { PetFace } from "@/components/pet-face";
import { RGBStatus } from "@/components/rgb-status";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";

export default function Home() {
  const preview = demoStates.up_alert;

  return (
    <main className="page-shell">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-slate-700/60 pb-5">
        <Link href="/" className="brand-mark">
          Market Light
        </Link>
        <div className="flex flex-wrap justify-end gap-4 text-sm font-medium text-slate-300">
          <Link className="transition hover:text-slate-100" href="/market">市場看盤</Link>
          <Link className="transition hover:text-slate-100" href="/demo">裝置展示</Link>
          <Link className="transition hover:text-slate-100" href="/watchlist">自選同步</Link>
          <Link className="transition hover:text-slate-100" href="/dashboard">控制台</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            系統在線
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-50 md:text-7xl">
            Market <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Light</span>
          </h1>
          <p className="mt-4 text-lg font-semibold text-indigo-200">
            低干擾市場提醒裝置
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            把即時金融資訊轉成 OLED、RGB 與市場小助手反應，讓桌面提醒剛剛好。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/demo"
              className="btn-primary"
            >
              裝置展示
            </Link>
            <Link
              href="/market"
              className="btn-secondary"
            >
              市場看盤
            </Link>
            <Link
              href="/watchlist"
              className="btn-secondary"
            >
              自選同步
            </Link>
          </div>
        </div>

        <CyberCard className="p-5" tone="pink">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">OLED 裝置預覽</span>
            <StatusBadge status="up_alert" />
          </div>
          <OLEDPreview line1={preview.line1} line2={preview.line2} line3={preview.line3} line4={preview.line4} status="up_alert" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            <RGBStatus status="up_alert" color="red" label="提醒燈號" />
            <PetFace status="up_alert" name="Miko" size="lg" />
          </div>
        </CyberCard>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        {[
          ["低干擾提醒", "用 OLED 與慢速 RGB pulse 取代高頻通知，讓桌面訊號保持克制。"],
          ["市場小助手", "把漲跌狀態轉成表情，展示比純數字更直覺。"],
          ["資料新鮮度", "顯示成交時間、更新秒數和來源，降低資料過期風險。"],
        ].map(([title, body], index) => (
          <CyberCard key={title} className="p-5" tone={index === 1 ? "pink" : index === 2 ? "yellow" : "cyan"}>
            <h2 className="text-base font-bold text-slate-50">{title}</h2>
            <p className="mt-4 leading-7 text-slate-300">{body}</p>
          </CyberCard>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <TerminalPanel title="裝置資料流" label="路由">
          <div className="space-y-3 text-center text-sm font-semibold">
            {["TWSE / OKX", "Market Light 雲端", "ESP32", "OLED / RGB / 實體按鈕"].map((step, index) => (
              <div key={step}>
                <div className="rounded-xl border border-slate-600/70 bg-slate-900/85 px-4 py-3 text-slate-100 shadow-[0_10px_24px_rgba(2,6,23,0.28)]">{step}</div>
                {index < 3 ? <div className="py-2 text-indigo-300">↓</div> : null}
              </div>
            ))}
          </div>
        </TerminalPanel>

        <TerminalPanel title="展示狀態預覽" label="狀態">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["calm", "up_alert", "down_alert", "error"] as const).map((status) => (
              <div key={status} className="soft-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <StatusBadge status={status} />
                  <PetFace status={status} size="sm" />
                </div>
                <p className="text-sm leading-6 text-slate-300">{demoStates[status].note}</p>
              </div>
            ))}
          </div>
        </TerminalPanel>
      </section>
    </main>
  );
}
