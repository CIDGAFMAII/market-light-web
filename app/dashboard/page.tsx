import Link from "next/link";
import { dashboardMock } from "@/lib/demo-data";
import { SettingRow } from "@/components/setting-row";
import { StatusBadge } from "@/components/status-badge";
import { TerminalPanel } from "@/components/terminal-panel";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-cyan/15 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="text-sm uppercase tracking-[0.18em] text-cyan">← 首頁</Link>
          <h1 className="mt-4 font-orbitron text-4xl font-black uppercase text-white">控制台</h1>
          <p className="mt-3 text-muted">第一階段的模擬控制介面，目前刻意不啟用登入與資料庫。</p>
        </div>
        <StatusBadge status="calm" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <TerminalPanel title="總覽" label="裝置">
          <SettingRow label="裝置名稱" value={dashboardMock.deviceName} />
          <SettingRow label="綁定狀態" value={dashboardMock.bindStatus} />
          <SettingRow label="裝置代碼" value={dashboardMock.deviceCode} />
          <SettingRow label="最後連線" value={dashboardMock.lastSeenAt} />
          <SettingRow label="股票數量" value={dashboardMock.stockCount} />
        </TerminalPanel>

        <TerminalPanel title="執行狀態" label="模擬">
          <SettingRow label="安靜模式" value={dashboardMock.quietMode} hint="暫停主動提醒行為。" />
          <SettingRow label="展示模式" value={dashboardMock.demoMode} hint="只使用本機模擬資料。" />
          <SettingRow label="小助手名稱" value={dashboardMock.petName} />
          <SettingRow label="API 狀態" value={dashboardMock.apiStatus} />
        </TerminalPanel>

        <TerminalPanel title="API 偵錯" label="PING" className="xl:col-span-2">
          <pre className="overflow-x-auto rounded border border-cyan/10 bg-black/45 p-4 text-sm leading-6 text-green-300">
            {JSON.stringify(
              {
                phase: 1,
                providers: ["TWSE", "OKX", "DEMO"],
                database: "未啟用",
                auth: "未啟用",
                esp32Firmware: "尚未產生",
                apiStatus: dashboardMock.apiStatus,
              },
              null,
              2,
            )}
          </pre>
        </TerminalPanel>
      </div>
    </div>
  );
}
